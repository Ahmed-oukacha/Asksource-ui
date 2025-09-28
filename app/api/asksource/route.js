// Fichier: app/api/asksource/route.js
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/config/db'; // Importer la connexion à la BDD
import Chat from '@/models/Chat'; // Importer le modèle de Chat

export async function POST(req) {
    try {
        // Authentification de l'utilisateur
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Utilisateur non authentifié." }, { status: 401 });
        }

        const body = await req.json();
        // Assurez-vous que chatId est bien extrait du corps de la requête
        const { prompt, chatId, projectId, searchMode, limit, denseLimit, sparseLimit } = body;

        if (!prompt || !projectId || !chatId) {
            return NextResponse.json({ success: false, message: "Le prompt, l'ID du projet et l'ID du chat sont requis." }, { status: 400 });
        }

        // **ÉTAPE 1: Sauvegarder le message de l'utilisateur dans la BDD**
        const userPrompt = {
            role: "user",
            content: prompt,
            timestamp: Date.now()
        };
        await connectDB();
        await Chat.findByIdAndUpdate(chatId, { $push: { messages: userPrompt } });

        // Préparation de l'appel au backend (logique existante)
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        let targetUrl = '';
        let payload = {};

        switch (searchMode) {
            case 'simple':
                targetUrl = `/api/nlp/index/answer_search/${projectId}`;
                payload = { text: prompt, limit: limit || 2 };
                break;
            case 'hybrid':
                targetUrl = `/api/nlp/index/answer_hybrid/${projectId}`;
                payload = { text: prompt, dense_limit: denseLimit || 10, sparse_limit: sparseLimit || 3, limit: limit || 3 };
                break;
            case 'advanced':
                targetUrl = `/api/nlp/index/answer_hybrid_cross/${projectId}`;
                payload = { text: prompt, dense_limit: denseLimit || 10, sparse_limit: sparseLimit || 5, limit: limit || 5 };
                break;
            default:
                return NextResponse.json({ success: false, message: "Mode de recherche non valide." }, { status: 400 });
        }

        const backendResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json();
            return NextResponse.json({ success: false, message: errorData.signal || "Erreur du backend" }, { status: backendResponse.status });
        }

        const data = await backendResponse.json();

        // **ÉTAPE 2: Sauvegarder la réponse de l'IA et la renvoyer**
        const assistantResponse = {
            role: 'assistant',
            content: data.answer,
            timestamp: Date.now()
        };

        await Chat.findByIdAndUpdate(chatId, { $push: { messages: assistantResponse } });

        return NextResponse.json({ success: true, data: assistantResponse });

    } catch (error) {
        console.error("Erreur dans le proxy API:", error);
        return NextResponse.json({ success: false, message: "Erreur interne du serveur proxy." }, { status: 500 });
    }
}