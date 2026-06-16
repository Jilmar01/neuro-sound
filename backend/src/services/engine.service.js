import { HttpError } from "../utils/httpError.js";

export const getRecommendationEngine = async (survey) => {
    try {

        const URI_ENGINE = process.env.URI_ENGINE;

        const response = await fetch(`${URI_ENGINE}motor/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                survey
            })
        });

        if (!response.ok) {
            throw new HttpError(
                'Error al generar la recomendacion',
                response.status
            );
        }

        return response.json();
    } catch (error) {
        throw new HttpError('Error al generar la recomendacion', 500);
    }
}