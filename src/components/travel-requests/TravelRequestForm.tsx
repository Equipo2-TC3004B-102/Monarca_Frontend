/**
 * TravelRequestForm.tsx
 * Description: Renders the travel request form for create/edit flows, validates inputs, and submits payloads to the API.
 * Authors: Original Monarca team
 * Last Modification made:
 * 24/02/2026 [Julio César Rodríguez Figueroa] Added detailed comments and documentation for clarity and maintainability.
 * 20/04/2026 [Sebastián Borjas] Fixed currency display on edit.
 * 20/04/2026 [Jin Sik Yoon] Improved error handling for better UX.
 * 20/04/2026 [Diego de la Vega] Enabled searchable origin/destination selectors with incremental filtering while typing.
 * 23/04/2026 [Santiago Coronado Hernández] Use PersistedForm hook to save form state in localStorage for better UX on accidental refreshes or navigation.
 * 04/05/2026 [Rebeca-Davila] Changed colors for dark mode
 */

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
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
import { useCallback, useEffect, useMemo, useRef } from "react";
import { makeCurrencyOptions } from "../../utils/currencies";
import { usePersistedForm } from "../../hooks/app/usePersistedForm";

type Option = { id: number | string; name: string };

// Static schema used only for type inference — messages don't affect types
const _destinationSchema = z.object({
  id_destination: z.string().nullable(),
  arrival_date: z.string().nonempty(),
  departure_date: z.string().nonempty(),
  stay_days: z.number().int(),
  is_hotel_required: z.boolean(),
  is_plane_required: z.boolean(),
  details: z.string().nonempty(),
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
  requests_destinations: z.array(_destinationSchema).min(1),
});

type FormValues = z.input<typeof _formSchema>;
type SubmitValues = z.output<typeof _formSchema>;

function makeFormSchema(t: TFunction) {
  const destinationSchema = z.object({
    id_destination: z.string().nullable(),
    arrival_date: z.string().nonempty({ message: t('validation.selectArrivalDate') }),
    departure_date: z.string().nonempty({ message: t('validation.selectDepartureDate') }),
    stay_days: z.number().int(),
    is_hotel_required: z.boolean(),
    is_plane_required: z.boolean(),
    details: z.string().nonempty({ message: t('validation.addDetails') }),
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
  destinationOptions: { id: string | number; name: string }[];
  destinationOptionsById: Map<string, { id: string | number; name: string }>;
  errors: FieldErrors<FormValues>["requests_destinations"];
  remove: (index: number) => void;
  setValue: UseFormSetValue<FormValues>;
  isLoadingDestinations: boolean;
}

function DestinationFields({
  idx,
  control,
  register,
  destinationOptions,
  destinationOptionsById,
  errors,
  remove,
  setValue,
  isLoadingDestinations,
}: DestinationFieldsProps) {
  const { t } = useTranslation();

  const arrivalDate = useWatch({
    control,
    name: `requests_destinations.${idx}.arrival_date`,
  });

  const departureDate = useWatch({
    control,
    name: `requests_destinations.${idx}.departure_date`,
  });

  const stayDays =
    arrivalDate && departureDate
      ? dayjs(arrivalDate).diff(dayjs(departureDate), "day")
      : 0;

  useEffect(() => {
    setValue(`requests_destinations.${idx}.stay_days`, stayDays);
  }, [arrivalDate, departureDate, idx, setValue, stayDays]);

  const destinationErrors = errors?.[idx];

  return (
    <div className="rounded-md p-4 mb-6 space-y-4 dark:bg-[var(--color-page-bg)] shadow-sm">
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
            htmlFor={`destination-${idx}`}
            className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
          >
            {t('form.destination')}
          </label>
          <Controller
            control={control}
            name={`requests_destinations.${idx}.id_destination`}
            render={({ field }) => (
              <SearchableSelect
                id={`destination-${idx}`}
                options={destinationOptions}
                value={
                  field.value
                    ? destinationOptionsById.get(String(field.value))
                    : null
                }
                onChange={(opt) => field.onChange(opt ? opt.id : null)}
                isLoading={isLoadingDestinations}
                placeholder={t('form.destinationPlaceholder')}
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
              <Input
                id={`departure-${idx}`}
                type="date"
                value={field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""}
                onChange={e => field.onChange(e.target.value)}
              />
            )}
          />
          <FieldError msg={destinationErrors?.departure_date?.message} />
        </div>

        <div>
          <label
            htmlFor={`arrival-${idx}`}
            className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
          >
            {t('form.arrivalDate')}
          </label>
          <Controller
            control={control}
            name={`requests_destinations.${idx}.arrival_date`}
            render={({ field }) => (
              <Input
                id={`arrival-${idx}`}
                type="date"
                value={field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""}
                onChange={e => field.onChange(e.target.value)}
              />
            )}
          />
          <FieldError msg={destinationErrors?.arrival_date?.message} />
        </div>

        <div>
          <label
            htmlFor={`stay-days-${idx}`}
            className="block mb-2 text-sm font-medium text-[var(--color-page-text)]"
          >
            {t('form.stayDays')}
          </label>
          <Input
            id={`stay-days-${idx}`}
            type="number"
            value={stayDays}
            readOnly
          />
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
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

function TravelRequestForm({ initialData, requestId }: TravelRequestFormProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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

  const { destinationOptions, isLoading: isLoadingDestinations } =
    useDestinations();
  const destinationOptionsById = useMemo(
    () =>
      new Map(
        destinationOptions.map((option) => [String(option.id), option]),
      ),
    [destinationOptions],
  );
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

    return {
      ...initialData,
      id_origin_city: initialData.id_origin_city ?? null,
      advance_money:
        initialData.advance_money !== undefined &&
        initialData.advance_money !== null
          ? Number.isFinite(parsedAdvanceMoney)
            ? parsedAdvanceMoney.toFixed(2)
            : "0.00"
          : "0.00",
      requests_destinations: initialData.requests_destinations.map((destination) => ({
        ...destination,
        details: destination.details ?? "",
      })),
    };
  }, [initialData]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
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
      advance_money: "0.00",
      currency: "",
      requirements: "",
      requests_destinations: [
        {
          id_destination: null,
          arrival_date: "",
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

  const persistStorageKey =
    isEditing && requestId
      ? `travelRequestForm:edit:${requestId}`
      : "travelRequestForm:create";

  const { clearPersistedForm } = usePersistedForm<FormValues, SubmitValues>({
    storageKey: persistStorageKey,
    control,
    reset,
    enabled: !isEditing,
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

    const hasInvalidStay = data.requests_destinations.some((d) => {
      const diff = dayjs(d.arrival_date).diff(dayjs(d.departure_date), "day");
      return diff <= 0;
    });

    if (hasInvalidStay) {
      toast.error(t('toast.positiveStayDays'), {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const requests_destinations = data.requests_destinations.map(
      (d, idx, arr) => {
        if (!d.id_destination) {
          throw new Error(t('form.destinationPlaceholder'));
        }

        return {
          id_destination: d.id_destination,
          destination_order: idx + 1,
          stay_days: d.stay_days,
          arrival_date: dayjs(d.arrival_date).toISOString(),
          departure_date: dayjs(d.departure_date).toISOString(),
          is_hotel_required: d.is_hotel_required,
          is_plane_required: d.is_plane_required,
          is_last_destination: idx === arr.length - 1,
          details: d.details,
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

              <div>
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
                      options={destinationOptions}
                      value={
                        field.value
                          ? destinationOptionsById.get(String(field.value))
                          : null
                      }
                      onChange={(opt) => opt && field.onChange(opt ? opt.id : null)}
                      isLoading={isLoadingDestinations}
                      placeholder={t('form.originCityPlaceholder')}
                    />
                  )}
                />
                <FieldError msg={errors.id_origin_city?.message} />
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
                  destinationOptions={destinationOptions}
                  destinationOptionsById={destinationOptionsById}
                  errors={errors.requests_destinations}
                  remove={remove}
                  setValue={setValue}
                  isLoadingDestinations={isLoadingDestinations}
                />
              ))}
            </div>
            <Button
              id="new_destination"
              type="button"
              onClick={() =>
                append({
                  id_destination: null,
                  arrival_date: "",
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
