import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // 中间件已经验证了用户身份
    // 你可以从请求头中获取用户信息（如果中间件添加了的话）
    const userId = req.headers.get('X-User-Id');
    const userRole = req.headers.get('X-User-Role');

    return NextResponse.json({
        message: `This is protected data for user ${userId} with role ${userRole}.`,
        data: [
            { id: 1, content: 'Secret info 1' },
            { id: 2, content: 'Secret info 2' },
        ],
    });
}