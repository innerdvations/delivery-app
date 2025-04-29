interface UpdatePositionArgs {
  identifier: string;
  latitude: number;
  longitude: number;
  key: string;
}

interface ApiResponse {
  message?: string;
  error?: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
  [key: string]: any;
}

export async function updateTruckPosition({
  identifier,
  latitude,
  longitude,
  key,
}: UpdatePositionArgs) {
  try {
    const url = 'http://localhost:1337/api/truck-tracker/update-position';
    const requestData = {
      identifier,
      latitude,
      longitude,
      key,
    };

    console.log('Sending request to:', url);
    console.log('Request data:', JSON.stringify(requestData, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = (await response.json()) as ApiResponse;

    if (!response.ok) {
      console.error('Full error response:', JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || data.message || 'Failed to update position');
    }

    console.log('Position updated successfully:', data);
  } catch (error) {
    console.error('Error updating position:', error instanceof Error ? error.message : error);
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length !== 4) {
    console.error(
      'Usage: ts-node update-truck-position.ts <identifier> <latitude> <longitude> <key>'
    );
    process.exit(1);
  }

  const [identifier, latitude, longitude, key] = args;

  updateTruckPosition({
    identifier,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    key,
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}
