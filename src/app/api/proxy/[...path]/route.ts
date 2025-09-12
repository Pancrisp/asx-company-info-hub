import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const apiPath = Array.isArray(path) ? path.join('/') : path;

    // Get search params from the request
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Construct the full API URL
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${apiPath}${
      queryString ? `?${queryString}` : ''
    }`;

    console.log('Proxying request to:', apiUrl);

    // Make the request to the external API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const apiPath = Array.isArray(path) ? path.join('/') : path;

    // Get the request body
    const body = await request.text();

    // Get search params from the request
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Construct the full API URL
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${apiPath}${
      queryString ? `?${queryString}` : ''
    }`;

    console.log('Proxying POST request to:', apiUrl);

    // Make the request to the external API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: body
    });

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
