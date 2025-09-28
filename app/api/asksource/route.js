// Fichier: app/api/asksource/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // 1. Extraire les données envoyées depuis le frontend
        const body = await req.json();
        const { prompt, projectId, searchMode, limit, denseLimit, sparseLimit } = body;

        if (!prompt || !projectId) {
            return NextResponse.json({ success: false, message: "Le prompt et l'ID du projet sont requis." }, { status: 400 });
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        let targetUrl = '';
        let payload = {};

        // 2. Déterminer l'URL et le payload du backend en fonction du mode de recherche
        switch (searchMode) {
            case 'simple':
                targetUrl = `/api/nlp/index/answer_search/${projectId}`;
                payload = {
                    text: prompt,
                    limit: limit || 2
                };
                break;
            
            case 'hybrid':
                targetUrl = `/api/nlp/index/answer_hybrid/${projectId}`;
                payload = {
                    text: prompt,
                    dense_limit: denseLimit || 10,
                    sparse_limit: sparseLimit || 3,
                    limit: limit || 3
                };
                break;
                
            case 'advanced':
                targetUrl = `/api/nlp/index/answer_hybrid_cross/${projectId}`;
                payload = {
                    text: prompt,
                    dense_limit: denseLimit || 10,
                    sparse_limit: sparseLimit || 5, // Note: sparse_limit est 5 pour le cross
                    limit: limit || 5
                };
                break;

            default:
                return NextResponse.json({ success: false, message: "Mode de recherche non valide." }, { status: 400 });
        }

        // 3. Appeler le backend Python/FastAPI
        const backendResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json();
            console.error("Erreur du backend:", errorData);
            return NextResponse.json({ success: false, message: errorData.signal || "Une erreur est survenue côté backend." }, { status: backendResponse.status });
        }

        const data = await backendResponse.json();

        // 4. Formater la réponse pour le frontend
        const formattedResponse = {
            role: 'assistant',
            content: data.answer,
        };

        return NextResponse.json({ success: true, data: formattedResponse });

    } catch (error) {
        console.error("Erreur dans le proxy API:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
