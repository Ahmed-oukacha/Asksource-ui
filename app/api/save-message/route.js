// Fichier: app/api/save-message/route.js
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/config/db';
import Chat from '@/models/Chat';

export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Non authentifié." }, { status: 401 });
        }

        const { chatId, message } = await req.json();
        if (!chatId || !message) {
            return NextResponse.json({ success: false, message: "chatId et message sont requis." }, { status: 400 });
        }

        await connectDB();
        await Chat.findByIdAndUpdate(chatId, { $push: { messages: message } });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erreur lors de la sauvegarde du message:", error);
        return NextResponse.json({ success: false, message: "Erreur interne du serveur." }, { status: 500 });
    }
}