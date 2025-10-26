import asyncio
import logging
import argparse
from aiocoap import *

# Configure logging to see what's happening
logging.basicConfig(level=logging.INFO)

async def observe_coach(coach_id, max_retries=5, retry_delay=3):
    """Observes available seats for a specific coach using CoAP."""
    
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Set up the CoAP context
            context = await Context.create_client_context()
            
            # The URI of the seat availability resource for the specified coach
            uri = f'coap://localhost/seats/{coach_id}/available'
            
            # Create the initial GET request and add the Observe option
            request = Message(code=GET, uri=uri, observe=0)

            # 'protocol.request' returns a request object that can receive multiple responses
            requester = context.request(request)
            
            # The first response is the initial state of the resource
            first_response = await requester.response
            initial_available = first_response.payload.decode('utf-8')
            print(f"\n{'='*50}")
            print(f"🚂 Monitoring Coach {coach_id} - Seat Availability")
            print(f"{'='*50}")
            print(f"Initial available seats: {initial_available}")
            print(f"Waiting for updates...\n")

            # Now, we iterate over any subsequent responses (the notifications)
            # This loop will run indefinitely as long as the server sends updates
            async for notification in requester.observation:
                available_seats = notification.payload.decode('utf-8')
                print(f"🔔 UPDATE >> Coach {coach_id} - Available seats: {available_seats}")

        except Exception as e:
            retry_count += 1
            if retry_count < max_retries:
                print(f"⚠️  Connection failed (attempt {retry_count}/{max_retries}): {e}")
                print(f"   Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                print(f"❌ Failed to connect after {max_retries} attempts: {e}")
                print(f"   Please check if the backend CoAP server is running on port 5683")
                break
        finally:
            try:
                await context.shutdown()
            except:
                pass

    if retry_count >= max_retries:
        print("Client shut down after max retries.")
    else:
        print("Client shut down.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='CoAP client to observe seat availability for a train coach')
    parser.add_argument("--coach", "-c", type=int, required=True, 
                       help="Coach number to observe (1-10)")
    args = parser.parse_args()

    # Validate coach number
    if args.coach < 1 or args.coach > 10:
        print("❌ Error: Coach number must be between 1 and 10")
        exit(1)

    try:
        asyncio.run(observe_coach(args.coach))
    except KeyboardInterrupt:
        print("\n\n👋 Observer client stopped by user.")