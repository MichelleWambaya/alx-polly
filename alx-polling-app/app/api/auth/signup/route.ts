import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    // TODO: Implement user registration logic
    console.log('Signup attempt:', { email })
    
    // Simulate user creation
    if (email && password) {
      const user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      }
      
      return NextResponse.json({ user }, { status: 201 })
    }
    
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
