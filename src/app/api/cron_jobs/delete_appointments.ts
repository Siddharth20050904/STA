"use server";
import { prisma } from "@/lib/prisma";
import { NextRequest,NextResponse } from "next/server";

export async function GET(request: NextRequest){
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }
    const now = new Date();
    const twoMonthAgo = new Date();
    twoMonthAgo.setMonth(now.getMonth() - 2);
    try{
        await prisma.appointments.deleteMany({
            where:{
                time:{
                    lt: twoMonthAgo
                }
            }
        });

        console.log("Deleted appointments of two month ago");
        return NextResponse.json({ success: true, message: 'Secure cron job executed' });
    }catch(err){
        console.log(err);
    }
}