import asyncio
import logging
from aiocoap import *

# Optional: configure logging to see what's happening
logging.basicConfig(level=logging.INFO)

async def main():
    """An observing CoAP client."""

    # Set up the CoAP context
    context = await Context.create_client_context()
    
    # The URI of the resource on your C# backend you want to observe
    uri = 'coap://localhost/counter'

    # Create the initial GET request and add the Observe option
    request = Message(code=GET, uri=uri, observe=0)

    try:
        # 'protocol.request' returns a request object that can receive multiple responses
        requester = context.request(request)
        
        # The first response is the initial state of the resource
        first_response = await requester.response
        print(f"Initial Response: {first_response.payload.decode('utf-8')}")

        # Now, we iterate over any subsequent responses (the notifications)
        # This loop will run indefinitely as long as the server sends updates
        async for notification in requester.observation:
            print(f"UPDATE >> Received notification: {notification.payload.decode('utf-8')}")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # This part will only be reached if the observation is cancelled or an error occurs
        await context.shutdown()
        print("Client shut down.")


if __name__ == "__main__":
    try:
        # Run the main asynchronous event loop
        asyncio.run(main())
    except KeyboardInterrupt:
        # Allows you to stop the client cleanly with Ctrl+C
        print("Observer client stopped by user.")