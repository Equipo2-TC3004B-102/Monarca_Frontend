/**
 * FileName: EditTravelRequest.tsx
 * Description: Renders the page for editing an existing travel request, including the travel request form pre-filled with the current data of the request being edited.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 06/05/2026 [Sergio Jiawei Xuan] Replaced hardcoded loading and error strings with i18n t() calls.
 */
import { useParams } from "react-router-dom";
import TravelRequestForm from "../components/travel-requests/TravelRequestForm";
import { useGetRequest } from "../hooks/requests/useGetRequest";
import { useTranslation } from "react-i18next";

/**
 * FunctionName: EditTravelRequest, renders the travel request editing page with pre-filled form data.
 * Input: none
 * Output: JSX component containing the travel request form with initial data pre-filled.
 */
function EditTravelRequest() {
  const { id } = useParams<{ id: string }>();
  const { data: travelRequest, isLoading } = useGetRequest(id!);
  const { t } = useTranslation();

  const normalizeAmount = (value: unknown): number | undefined => {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  };

  console.log(travelRequest);

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  if (!travelRequest) {
    return <div>{t('common.requestNotFound')}</div>;
  }

  return (
    <div>
      <TravelRequestForm
        requestId={id}
        initialData={{
          ...travelRequest,
          advance_money:
            normalizeAmount(travelRequest.unconverted_advance_money) ??
            normalizeAmount(travelRequest.advance_money),
        }}
      />
    </div>
  );
}

export default EditTravelRequest;
