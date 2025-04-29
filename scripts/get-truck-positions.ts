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

export async function getTruckPositions(bearer: string) {
  try {
    const url = 'http://localhost:1337/truck-tracker/truck-positions';

    console.log('Fetching truck positions from:', url);

    const response = await fetch(url, {
      // headers: {
      // Authorization: `Bearer ${bearer}`,
      // },
    });

    if (!response.ok) {
      const data = (await response.json()) as ApiResponse;
      console.error('Failed to fetch truck positions:', data.error?.message || data.message);
      return;
    }

    const positions = await response.json();
    console.log('Current truck positions:', JSON.stringify(positions, null, 2));
  } catch (error) {
    console.error(
      'Error fetching truck positions:',
      error instanceof Error ? error.message : error
    );
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);

  // if (args.length !== 1) {
  //   console.error('Usage: ts-node get-truck-positions.ts <bearer-token>');
  //   process.exit(1);
  // }

  const [bearer] = args;

  getTruckPositions(bearer).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}
