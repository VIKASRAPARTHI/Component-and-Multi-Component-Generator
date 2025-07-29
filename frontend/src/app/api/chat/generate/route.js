import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../../../backend/src/config/database';
import Session from '../../../../../backend/src/models/Session';
import Message from '../../../../../backend/src/models/Message';

// Import AI service functions
async function generateWithOpenRouter(prompt, model = 'openai/gpt-4') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert React component generator. Generate clean, modern React components with Tailwind CSS styling. Return only the JSX code without explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function POST(request) {
  try {
    await connectDB();

    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { prompt, sessionId, model = 'openai/gpt-4' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Find or create session
    let session;
    if (sessionId) {
      session = await Session.findOne({ _id: sessionId, userId });
      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Session not found' },
          { status: 404 }
        );
      }
    } else {
      session = await Session.create({
        userId,
        title: prompt.substring(0, 50) + '...',
        lastActivity: new Date()
      });
    }

    // Save user message
    const userMessage = await Message.create({
      sessionId: session._id,
      role: 'user',
      content: prompt
    });

    // Generate component
    const generatedCode = await generateWithOpenRouter(prompt, model);

    // Save assistant message
    const assistantMessage = await Message.create({
      sessionId: session._id,
      role: 'assistant',
      content: generatedCode,
      componentData: {
        jsx: generatedCode,
        css: '',
        props: {}
      }
    });

    // Update session
    session.lastActivity = new Date();
    await session.save();

    return NextResponse.json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        lastActivity: session.lastActivity
      },
      message: {
        _id: assistantMessage._id,
        role: 'assistant',
        content: generatedCode,
        componentData: assistantMessage.componentData,
        createdAt: assistantMessage.createdAt
      }
    });

  } catch (error) {
    console.error('Chat generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate component' },
      { status: 500 }
    );
  }
}
