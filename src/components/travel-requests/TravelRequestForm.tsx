/**
 * TravelRequestForm.tsx
 * Description: Renders the travel request form for create/edit flows, validates inputs, and submits payloads to the API.
 * Authors: Original Monarca team
 * Last Modification made:
 * 04/06/2026 [Sergio Jiawei Xuan] Separated destination into cascading country/city dropdowns, matching origin field behavior.
 */

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { DateInput } from "../ui/DateInput";
import { TextArea } from "../ui/TextArea";
import Switch from "../ui/Switch";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  Resolver,
} from "react-hook-form";
import { Destination } from "../../types/destinations";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import Select from "../ui/Select";
import SearchableSelect from "../ui/SearchableSelect";
import FieldError from "../ui/FieldError";
import { useCreateTravelRequest } from "../../hooks/requests/useCreateRequest";
import { useUpdateTravelRequest } from "../../hooks/requests/useUpdateRequest";
import { useDestinations } from "../../hooks/destinations/useDestinations";
import { CreateRequest } from "../../types/requests";
import GoBack from "../GoBack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { makeCurrencyOptions } from "../../utils/currencies";
import { usePersistedForm } from "../../hooks/app/usePersistedForm";
import { useAuth } from "../../hooks/auth/authContext";
import { translateCountry } from "../../utils/translateCountry";
import { translateCity } from "../../utils/translateCity";

type Option = { id: number | string; name: string };

// Static schema used only for type inference — messages don't affect types
const _destinationSchema = z.object({
  id_destination: z.string().nullable(),
  departure_date: z.string().nonempty(),
  stay_days: z.number().int(),
  is_hotel_required: z.boolean(),
  is_plane_required: z.boolean(),
  details: z.string().optional(),
});

const _formSchema = z.object({
  id_origin_city: z.string().nullable(),
  motive: z.string().nonempty(),
  title: z.string().nonempty(),
  priority: z.enum(["alta", "media", "baja"]),
  requirements: z.string().nullable().optional(),
  advance_money: z
    .string()
    .trim()
    .nonempty()
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v))
    .transform((v) => Number(v))
    .refine((v) => v >= 0),
  currency: z.string().nonempty(),
  return_date: z.string().nonempty(),
  requests_destinations: z.array(_destinationSchema).min(1),
});

type FormValues = z.input<typeof _formSchema>;
type SubmitValues = z.output<typeof _formSchema>;

function makeFormSchema(t: TFunction) {
  const destinationSchema = z.object({
    id_destination: z.string().nullable(),
    departure_date: z.string().nonempty({ message: t('validation.selectDepartureDate') }),
    stay_days: z.number().int(),
    is_hotel_required: z.boolean(),
    is_plane_required: z.boolean(),
    details: z.string().optional(),
  });

  return z.object({
    id_origin_city: z.string().nullable(),
    motive: z.string().nonempty({ message: t('validation.writeMotive') }),
    title: z.string().nonempty({ message: t('validation.writeTitle') }),
    priority: z.enum(["alta", "media", "baja"]),
    requirements: z.string().nullable().optional(),
    advance_money: z
      .string()
      .trim()
      .nonempty({ message: t('validation.advanceMoneyRequired') })
      .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
        message: t('validation.validNumber'),
      })
      .transform((value) => Number(value))
      .refine((value) => value >= 0, {
        message: t('validation.nonNegativeAdvanceMoney'),
      }),
    currency: z.string().nonempty({ message: t('validation.selectCurrency') }),
    return_date: z.string().nonempty({ message: t('validation.selectReturnDate') }),
    requests_destinations: z
      .array(destinationSchema)
      .min(1, t('validation.atLeastOneDestination')),
  });
}

interface TravelRequestFormProps {
  initialData?: CreateRequest;
  requestId?: string;
}

interface DestinationFieldsProps {
  idx: number;
  control: Control<FormValues, unknown, SubmitValues>;
  register: UseFormRegister<FormValues>;
  destinations: Destination[];
  setValue: UseFormSetValue<FormValues>;
  errors: FieldErrors<FormValues>["requests_destinations"];
  remove: (index: number) => void;
  isLoadingDestinations: boolean;
}

/**
 * FunctionName: DestinationFields — renders inputs for a single destination leg.
 * Country + city are separated like the origin field.
 * arrival_date and stay_days are derived automatically at submit time.
 */
function DestinationFields({
  idx,
  control,
  register,
  destinations,
  setValue,
  errors,
  remove,
  isLoadingDestinations,
}: DestinationFieldsProps) {
  const { t, i18n } = useTranslation();
  const destinationErrors = errors?.[idx];
  const [destCountry, setDestCountry] = useState<string>("");

  const destCountryOptions = useMemo(() => {
    const unique = [...new Set(destinations.map((d) => d.country).filter(Boolean))].sort();
    return unique.map((c) => ({ id: c, name: translateCountry(c, i18n.language) }));
  }, [destinations, i18n.language]);

  const destCityOptions = useMemo(() => {
    const filtered = destCountry
      ? destinations.filter((d) => d.country === destCountry)
      : destinations;
    const cityMap = new Map<string, Option>();
    for (const d of filtered) {
      if (d.city && !cityMap.has(d.city)) {
        cityMap.set(d.city, { id: d.id, name: translateCity(d.city, i18n.language) });
      }
    }
    return Array.from(cityMap.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "es", { sensitivity: "base" })
    );
  }, [destinations, destCountry, i18n.language]);

  const watchedDest = useWatch({ control, name: `requests_destinations.${idx}.id_destination` });
  useEffect(() => {
    if (watchedDest && !destCountry && destinations.length > 0) {
      const dest = destinations.find((d) => d.id === watchedDest);
      if (dest?.country) setDestCountry(dest.country);
    }
  }, [watchedDest, destinations]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-md p-4 mb-6 space-y-4 bg-[var(--color-page-bg)] shadow-sm">
      <div className="flex justify-between items-center">
        <span className="font-medium text-[var(--color-page-text)]">{t('form.destinationNum', { num: idx + 1 })}</span>
        {idx > 0 && (
          <Button type="button" onClick={() => remove(idx)}>
            {t('form.remove')}
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`dest-country-${idx}`}
            className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
          >
            {t('form.destinationCountry')}
          </label>
          <SearchableSelect
            id={`dest-country-${idx}`}
            options={destCountryOptions}
            value={destCountry ? destCountryOptions.find((o) => o.id === destCountry) ?? null : null}
            onChange={(opt) => {
              setDestCountry(opt ? String(opt.id) : "");
              setValue(`requests_destinations.${idx}.id_destination`, null);
            }}
            isLoading={isLoadingDestinations}
            placeholder={t('form.destinationCountryPlaceholder')}
          />
        </div>

        <div>
          <label
            htmlFor={`destination-${idx}`}
            className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
          >
            {t('form.destinationCity')}
          </label>
          <Controller
            control={control}
            name={`requests_destinations.${idx}.id_destination`}
            render={({ field }) => (
              <SearchableSelect
                id={`destination-${idx}`}
                options={destCityOptions}
                value={field.value ? destCityOptions.find((o) => o.id === field.value) ?? null : null}
                onChange={(opt) => field.onChange(opt ? opt.id : null)}
                isLoading={isLoadingDestinations}
                placeholder={destCountry ? t('form.destinationPlaceholder') : t('form.destinationCountryFirst')}
              />
            )}
          />
          <FieldError msg={destinationErrors?.id_destination?.message} />
        </div>

        <div>
          <label
            htmlFor={`details-${idx}`}
            className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
          >
            {t('form.details')}
          </label>
          <Input
            id={`details-${idx}`}
            {...register(`requests_destinations.${idx}.details`)}
          />
          <FieldError msg={destinationErrors?.details?.message} />
        </div>

        <div>
          <label
            htmlFor={`departure-${idx}`}
            className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
          >
            {t('form.departureDate')}
          </label>
          <Controller
            control={control}
            name={`requests_destinations.${idx}.departure_date`}
            render={({ field }) => (
              <DateInput
                id={`departure-${idx}`}
                value={field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""}
                onChange={field.onChange}
              />
            )}
          />
          <FieldError msg={destinationErrors?.departure_date?.message} />
        </div>

        <div>
          <label
            htmlFor={`hotel-${idx}`}
            className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
          >
            {t('form.needsHotel')}
          </label>
          <Controller
            control={control}
            name={`requests_destinations.${idx}.is_hotel_required`}
            render={({ field }) => (
              <Switch
                id={`hotel-${idx}`}
                checked={field.value}
                onChange={field.onChange}
                className="data-[checked]:bg-[var(--ultra-light-blue)]"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor={`plane-${idx}`}
            className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
          >
            {t('form.needsFlight')}
          </label>
          <Controller
            control={control}
            name={`requests_destinations.${idx}.is_plane_required`}
            render={({ field }) => (
              <Switch
                id={`plane-${idx}`}
                checked={field.value}
                onChange={field.onChange}
                className="data-[checked]:bg-[var(--ultra-light-blue)]"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * FunctionName: TravelRequestForm, renders the travel request form with dynamic fields and validation.
 * Inputs: initialData (TravelRequestData | undefined) - Initial data for the form, requestId (string | undefined) - ID of the travel request being edited.
 * Returns: JSX.Element - Form UI for creating or editing travel requests.
 */
function TravelRequestForm({ initialData, requestId }: TravelRequestFormProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { authState } = useAuth();

  const tRef = useRef(t);
  tRef.current = t;

  const resolver = useCallback<Resolver<FormValues, unknown, SubmitValues>>(
    (values, context, options) =>
      zodResolver(makeFormSchema(tRef.current))(values, context, options),
    [],
  );

  const priorityOptions: Option[] = useMemo(() => [
    { id: "alta", name: t('priority.high') },
    { id: "media", name: t('priority.medium') },
    { id: "baja", name: t('priority.low') },
  ], [t]);

  const currencyOptions = useMemo(() => makeCurrencyOptions(t), [t]);

  const { destinations, isLoading: isLoadingDestinations } =
    useDestinations();

  const [originCountry, setOriginCountry] = useState<string>("");

  const originCountries: Option[] = useMemo(() => {
    const unique = [...new Set(destinations.map((d) => d.country).filter(Boolean))].sort();
    return unique.map((c) => ({ id: c, name: translateCountry(c, i18n.language) }));
  }, [destinations, i18n.language]);

  const originCityOptions: Option[] = useMemo(() => {
    const filtered = originCountry
      ? destinations.filter((d) => d.country === originCountry)
      : destinations;
    const cityMap = new Map<string, Option>();
    for (const d of filtered) {
      if (d.city && !cityMap.has(d.city)) {
        cityMap.set(d.city, { id: d.id, name: translateCity(d.city, i18n.language) });
      }
    }
    return Array.from(cityMap.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "es", { sensitivity: "base" })
    );
  }, [destinations, originCountry, i18n.language]);

  const { createTravelRequestMutation, isPending: isCreating } =
    useCreateTravelRequest();
  const { updateTravelRequestMutation, isPending: isUpdating } =
    useUpdateTravelRequest();

  const isEditing = !!requestId;
  const isPending = isEditing ? isUpdating : isCreating;

  const initialFormValues = useMemo<FormValues | undefined>(() => {
    if (!initialData) {
      return undefined;
    }

    const parsedAdvanceMoney = Number(initialData.advance_money);
    const dests = initialData.requests_destinations ?? [];
    // The return date is stored as arrival_date of the last destination
    const lastDest = dests[dests.length - 1];
    const returnDate = lastDest?.arrival_date
      ? dayjs(lastDest.arrival_date).format("YYYY-MM-DD")
      : "";

    return {
      ...initialData,
      id_origin_city: initialData.id_origin_city ?? null,
      return_date: returnDate,
      advance_money:
        initialData.advance_money !== undefined &&
        initialData.advance_money !== null
          ? Number.isFinite(parsedAdvanceMoney)
            ? parsedAdvanceMoney.toFixed(2)
            : "0.00"
          : "0.00",
      requests_destinations: dests.map((destination) => ({
        id_destination: destination.id_destination,
        departure_date: destination.departure_date ?? "",
        stay_days: destination.stay_days ?? 1,
        is_hotel_required: destination.is_hotel_required,
        is_plane_required: destination.is_plane_required,
        details: destination.details ?? "",
      })),
    };
  }, [initialData]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    trigger,
  } = useForm<FormValues, unknown, SubmitValues>({
    resolver,
    defaultValues: initialFormValues || {
      id_origin_city: null,
      motive: "",
      title: "",
      priority: "media",
      advance_money: "",
      currency: "",
      requirements: "",
      return_date: "",
      requests_destinations: [
        {
          id_destination: null,
          departure_date: "",
          stay_days: 1,
          is_hotel_required: true,
          is_plane_required: true,
          details: "",
        },
      ],
    },
  });

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) trigger();
  }, [i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

  const watchedOriginCity = useWatch({ control, name: "id_origin_city" });

  useEffect(() => {
    if (watchedOriginCity && !originCountry && destinations.length > 0) {
      const dest = destinations.find((d) => d.id === watchedOriginCity);
      if (dest?.country) setOriginCountry(dest.country);
    }
  }, [watchedOriginCity, destinations]); // eslint-disable-line react-hooks/exhaustive-deps

  const persistStorageKey =
    isEditing && requestId
      ? `travelRequestForm:edit:${requestId}`
      : `travelRequestForm:create:${authState.userId}`;

  const { clearPersistedForm } = usePersistedForm<FormValues, SubmitValues>({
    storageKey: persistStorageKey,
    control,
    reset,
    enabled: !isEditing,
    isDirty,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requests_destinations",
  });

  const onSubmit = async (data: SubmitValues) => {
    if (!data.id_origin_city) {
      toast.error(t('toast.selectOrigin'));
      return;
    }

    // Validate sequential departure dates
    for (let i = 1; i < data.requests_destinations.length; i++) {
      const prevDest = data.requests_destinations[i - 1];
      const currDest = data.requests_destinations[i];
      if (!prevDest || !currDest) continue;
      const prev = dayjs(prevDest.departure_date);
      const curr = dayjs(currDest.departure_date);
      if (!curr.isAfter(prev)) {
        toast.error(t('toast.departureDateOrder', { num: i + 1 }), {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }
    }

    // Validate return date is after last departure
    const lastDest = data.requests_destinations[data.requests_destinations.length - 1];
    const lastDeparture = dayjs(lastDest?.departure_date ?? "");
    if (!dayjs(data.return_date).isAfter(lastDeparture)) {
      toast.error(t('toast.returnDateAfterLast'), {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    // Derive arrival_date and stay_days for each destination
    const requests_destinations = data.requests_destinations.map(
      (d, idx, arr) => {
        if (!d.id_destination) {
          throw new Error(t('form.destinationPlaceholder'));
        }
        // arrival = next destination's departure, or return_date for the last leg
        const nextDest = arr[idx + 1];
        const arrivalIso = idx < arr.length - 1
          ? dayjs(nextDest?.departure_date).toISOString()
          : dayjs(data.return_date).toISOString();
        const stayDays = dayjs(arrivalIso).diff(dayjs(d.departure_date), "day");

        return {
          id_destination: d.id_destination,
          destination_order: idx + 1,
          stay_days: stayDays,
          arrival_date: arrivalIso,
          departure_date: dayjs(d.departure_date).toISOString(),
          is_hotel_required: d.is_hotel_required,
          is_plane_required: d.is_plane_required,
          is_last_destination: idx === arr.length - 1,
          details: d.details || undefined,
        };
      }
    );

    const payload = {
      id_origin_city: data.id_origin_city,
      title: data.title,
      motive: data.motive,
      requirements: data.requirements || undefined,
      priority: data.priority.toLowerCase() as "alta" | "media" | "baja",
      advance_money: data.advance_money,
      currency: data.currency,
      requests_destinations,
    };

    try {
      if (isEditing && requestId) {
        await updateTravelRequestMutation({ requestId, payload });
        toast.success(t('toast.requestUpdated'));
      } else {
        await createTravelRequestMutation(payload);
        toast.success(t('toast.requestCreated'));
      }

      clearPersistedForm();
      reset();
      setOriginCountry("");
      navigate("/dashboard");
    } catch (error) {
      let errorMessage = isEditing
        ? t('toast.errorUpdating')
        : t('toast.errorCreating');

      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <GoBack />
      <section className="bg-[var(--color-card-bg)] rounded-md mb-10">
        <div className="p-10 mx-auto">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)] mt-0 mb-4">
            {isEditing ? t('form.editTrip') : t('form.travelData')}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6" id="travel_request_info">
              <div className="sm:col-span-2">
                <label
                  htmlFor="motive"
                  className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
                >
                  {t('form.motive')}
                </label>
                <Input
                  id="motive"
                  {...register("motive")}
                  placeholder={t('form.motivePlaceholder')}
                />
                <FieldError msg={errors.motive?.message} />
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
                >
                  {t('form.title')}
                </label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder={t('form.titlePlaceholder')}
                />
                <FieldError msg={errors.title?.message} />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label
                    htmlFor="origin_country"
                    className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
                  >
                    {t('form.originCountry')}
                  </label>
                  <SearchableSelect
                    id="origin_country"
                    options={originCountries}
                    value={
                      originCountry
                        ? originCountries.find((o) => o.id === originCountry) ?? null
                        : null
                    }
                    onChange={(opt) => {
                      setOriginCountry(opt ? String(opt.id) : "");
                      setValue("id_origin_city", null);
                    }}
                    isLoading={isLoadingDestinations}
                    placeholder={t('form.originCountryPlaceholder')}
                  />
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="id_origin_city"
                    className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
                  >
                    {t('form.originCity')}
                  </label>
                  <Controller
                    control={control}
                    name="id_origin_city"
                    render={({ field }) => (
                      <SearchableSelect
                        id="id_origin_city"
                        options={originCityOptions}
                        value={
                          field.value
                            ? originCityOptions.find((o) => o.id === field.value) ?? null
                            : null
                        }
                        onChange={(opt) => field.onChange(opt ? opt.id : null)}
                        isLoading={isLoadingDestinations}
                        isDisabled={!originCountry}
                        placeholder={
                          originCountry
                            ? t('form.originCityPlaceholder')
                            : t('form.originCityDisabledPlaceholder')
                        }
                      />
                    )}
                  />
                  <FieldError msg={errors.id_origin_city?.message} />
                </div>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
                >
                  {t('form.priority')}
                </label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select
                      id="priority"
                      options={priorityOptions}
                      value={priorityOptions.find((o) => o.id === field.value)}
                      onChange={(opt) => opt && field.onChange(opt.id)}
                      placeholder={t('form.priorityPlaceholder')}
                    />
                  )}
                />
                <FieldError msg={errors.priority?.message} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3">
                  <label
                    htmlFor="advance_money"
                    className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
                  >
                    {t('form.advanceMoney')}
                  </label>
                  <Controller
                    control={control}
                    name="advance_money"
                    render={({ field }) => (
                      <Input
                        id="advance_money"
                        type="number"
                        min={0}
                        step="any"
                        placeholder="0.00"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            field.onChange("");
                            return;
                          }
                          if (/^\d*\.?\d{0,2}$/.test(value)) {
                            field.onChange(value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.trim();

                          if (value === "") {
                            field.onChange("0.00");
                            return;
                          }

                          const num = Number(value);
                          if (!isNaN(num)) {
                            field.onChange(num.toFixed(2));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    )}
                  />
                  <FieldError msg={errors.advance_money?.message} />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="currency"
                    className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
                  >
                    {t('form.currency')}
                  </label>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <SearchableSelect
                        id="currency"
                        options={currencyOptions}
                        value={currencyOptions.find((o) => o.id === field.value)}
                          onChange={(opt) => field.onChange(opt ? opt.id : "")}
                        placeholder={t('form.currency')}
                      />
                    )}
                  />
                  <FieldError msg={errors.currency?.message} />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="requirements"
                  className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
                >
                  {t('form.additionalRequirements')}
                </label>
                <TextArea
                  id="requirements"
                  {...register("requirements")}
                  placeholder={t('form.additionalRequirementsPlaceholder')}
                />
              </div>
            </div>

            <div id="destination_info">
              <h3 className="mt-8 mb-4 text-lg font-semibold text-[var(--color-page-text)]">{t('form.destinations')}</h3>
              {fields.map((field, idx) => (
                <DestinationFields
                  key={field.id}
                  idx={idx}
                  control={control}
                  register={register}
                  destinations={destinations}
                  setValue={setValue}
                  errors={errors.requests_destinations}
                  remove={remove}
                  isLoadingDestinations={isLoadingDestinations}
                />
              ))}

              {/* Single return date shared across the whole trip */}
              <div className="rounded-md p-4 mb-6 bg-[var(--color-page-bg)] shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="return_date"
                      className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
                    >
                      {t('form.returnDate')}
                    </label>
                    <Controller
                      control={control}
                      name="return_date"
                      render={({ field }) => (
                        <DateInput
                          id="return_date"
                          value={field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FieldError msg={(errors as any).return_date?.message} />
                  </div>
                </div>
              </div>
            </div>
            <Button
              id="new_destination"
              type="button"
              onClick={() =>
                append({
                  id_destination: null,
                  departure_date: "",
                  stay_days: 1,
                  is_hotel_required: false,
                  is_plane_required: true,
                  details: "",
                })
              }
            >
              {t('form.addDestination')}
            </Button>

            <Button type="submit" className="mt-4 sm:mt-6" disabled={isPending} id={isEditing ? "update_travel_request" : "create_travel_request"}>
              {isPending
                ? isEditing
                  ? t('form.updating')
                  : t('form.creating')
                : isEditing
                  ? t('form.updateTrip')
                  : t('form.createTrip')}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default TravelRequestForm;
