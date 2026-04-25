/**
 * FileName: EditTravelRequest.tsx
 * Description: Renders the page for editing an existing travel request, including the travel request form pre-filled with the current data of the request being edited.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 20/04/2026 [Sebastián Borjas] Fixed currency display on edit.
 */
import { useParams } from "react-router-dom";
import TravelRequestForm from "../components/travel-requests/TravelRequestForm";
import { useGetRequest } from "../hooks/requests/useGetRequest";

/**
 * FunctionName: EditTravelRequest, renders the travel request editing page with pre-filled form data.
 * Input: none
 * Output: JSX component containing the travel request form with initial data pre-filled.
 */
function EditTravelRequest() {
  const { id } = useParams<{ id: string }>();
  const { data: travelRequest, isLoading } = useGetRequest(id!);

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
    return <div>Cargando...</div>;
  }

  if (!travelRequest) {
    return <div>No se encontró la solicitud de viaje</div>;
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
