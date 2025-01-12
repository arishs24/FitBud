import asyncio
import websockets
import json
from fetch import fetch_medical_information, store_medical_information

async def handle_client(websocket):
    """
    Handles incoming WebSocket connections and processes user requests.
    """
    async for message in websocket:
        try:
            # The message is the medical condition provided by the frontend
            condition = message.strip()
            print(f"Received condition: {condition}")
            
            # Fetch medical information
            information = fetch_medical_information(condition)
            
            if information:
                # Store in the database
                store_medical_information(condition, information)
                # Send the information back to the frontend
                response = {"status": "success", "condition": condition, "information": information}
            else:
                response = {"status": "error", "message": f"Could not find information for {condition}."}
                
            # Convert the response to proper JSON before sending
            await websocket.send(json.dumps(response))
        except Exception as e:
            print(f"Error handling client message: {e}")
            error_response = {"status": "error", "message": str(e)}
            await websocket.send(json.dumps(error_response))

async def main():
    # Start the WebSocket server
    server = await websockets.serve(handle_client, "localhost", 8765)
    print("WebSocket server is running on ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    # Create and run the event loop
    asyncio.run(main())