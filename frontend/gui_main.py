import asyncio
import logging
import argparse
import tkinter as tk
from threading import Thread
from aiocoap import *

logging.basicConfig(level=logging.INFO)

class SeatDisplayGUI:
    def __init__(self, carriage_id):
        self.carriage_id = carriage_id
        self.current_seats = None  # Track last value for deduplication
        
        self.root = tk.Tk()
        self.root.title(f"Train carriage {carriage_id} - Seat Monitor")
        self.root.geometry("600x400")
        self.root.configure(bg='#1a1a2e')
        
        # Header
        header_frame = tk.Frame(self.root, bg='#16213e', pady=20)
        header_frame.pack(fill='x')
        
        tk.Label(
            header_frame,
            text=f"🚂 carriage {carriage_id}",
            font=('Helvetica', 24, 'bold'),
            fg='#ffffff',
            bg='#16213e'
        ).pack()
        
        # Main display area
        main_frame = tk.Frame(self.root, bg='#1a1a2e')
        main_frame.pack(expand=True, fill='both', pady=20)
        
        # Available seats label
        tk.Label(
            main_frame,
            text="AVAILABLE SEATS",
            font=('Helvetica', 18),
            fg='#a8b2d1',
            bg='#1a1a2e'
        ).pack()
        
        # Big number display
        self.seats_label = tk.Label(
            main_frame,
            text="--",
            font=('Helvetica', 120, 'bold'),
            fg='#64ffda',
            bg='#1a1a2e'
        )
        self.seats_label.pack(pady=20)
        
        # Total capacity display (out of 24)
        self.capacity_label = tk.Label(
            main_frame,
            text="/ 24 total seats",
            font=('Helvetica', 16),
            fg='#8892b0',
            bg='#1a1a2e'
        )
        self.capacity_label.pack()
        
        # Status bar
        status_frame = tk.Frame(self.root, bg='#16213e', pady=10)
        status_frame.pack(fill='x', side='bottom')
        
        self.status_label = tk.Label(
            status_frame,
            text="🔄 Connecting to CoAP server...",
            font=('Helvetica', 12),
            fg='#a8b2d1',
            bg='#16213e'
        )
        self.status_label.pack()
        
    def update_seats(self, available_seats):
        """Update the displayed seat count (only if value changed)"""
        # Deduplication logic: only update if value actually changed
        if available_seats == self.current_seats:
            return  # Skip update if same value
        
        self.current_seats = available_seats
        self.seats_label.config(text=str(available_seats))
        
        # Change color based on availability
        if available_seats >= 18:
            color = '#64ffda'  # Green - plenty available
        elif available_seats >= 12:
            color = '#ffd700'  # Yellow - moderate
        elif available_seats >= 6:
            color = '#ff8c00'  # Orange - getting full
        else:
            color = '#ff6b6b'  # Red - almost full
        
        self.seats_label.config(fg=color)
        
        # Calculate occupancy percentage
        occupied = 24 - available_seats
        occupancy_pct = (occupied / 24) * 100
        
        self.capacity_label.config(
            text=f"/ 24 total seats ({occupancy_pct:.1f}% occupied)"
        )
    
    def update_status(self, message):
        """Update the status message"""
        self.status_label.config(text=message)
    
    def run(self):
        """Start the GUI main loop"""
        self.root.mainloop()

async def observe_carriage(gui, carriage_id):
    """Async function to observe CoAP resource"""
    max_retries = 5
    retry_delay = 3
    
    for attempt in range(1, max_retries + 1):
        try:
            context = await Context.create_client_context()
            uri = f'coap://localhost/seats/{carriage_id}/available'
            request = Message(code=GET, uri=uri, observe=0)
            
            gui.update_status(f"🔄 Connecting to CoAP server (attempt {attempt}/{max_retries})...")
            
            print(f"\n{'='*60}")
            print(f"📡 CoAP GET → {uri}")
            print(f"{'='*60}")
            
            requester = context.request(request)
            first_response = await requester.response
            
            print(f"✅ CoAP Response:")
            print(f"  Code: {first_response.code}")
            print(f"  Payload: {first_response.payload.decode('utf-8')}")
            print(f"{'='*60}\n")
            
            initial_seats = int(first_response.payload.decode('utf-8'))
            gui.update_seats(initial_seats)
            gui.update_status(f"✅ Connected! Monitoring real-time updates...")
            
            print(f"✅ Connected! Initial available seats: {initial_seats}")
            
            # Listen for updates
            async for notification in requester.observation:
                print(f"\n{'='*60}")
                print(f"🔔 CoAP OBSERVE Update:")
                print(f"  URI: {uri}")
                print(f"  Code: {notification.code}")
                print(f"  Payload: {notification.payload.decode('utf-8')}")
                print(f"{'='*60}\n")
                
                available_seats = int(notification.payload.decode('utf-8'))
                # GUI will handle deduplication in update_seats()
                gui.update_seats(available_seats)
            
        except Exception as e:
            error_msg = str(e)
            await context.shutdown()
            
            print(f"\n❌ CoAP Error: {error_msg}\n")
            
            if "Connect call failed" in error_msg or "NetworkError" in error_msg:
                if attempt < max_retries:
                    gui.update_status(f"⚠️ Connection failed. Retrying in {retry_delay}s... ({attempt}/{max_retries})")
                    print(f"⚠️ Connection failed. Retrying in {retry_delay} seconds... (attempt {attempt}/{max_retries})")
                    await asyncio.sleep(retry_delay)
                else:
                    gui.update_status(f"❌ Failed to connect after {max_retries} attempts")
                    print(f"❌ Failed to connect after {max_retries} attempts.")
                    print("💡 Make sure the backend CoAP server is running on localhost:5683")
                    break
            else:
                gui.update_status(f"❌ Error: {error_msg}")
                print(f"❌ An unexpected error occurred: {e}")
                break

def start_observer(gui, carriage_id):
    """Start the CoAP observer in an asyncio event loop"""
    asyncio.run(observe_carriage(gui, carriage_id))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GUI seat availability monitor for train carriages")
    parser.add_argument("--carriage", "-c", type=int, required=True, 
                       choices=range(1, 11), metavar="[1-10]",
                       help="Carriage number to monitor (1-10)")
    args = parser.parse_args()
    
    # Create GUI
    gui = SeatDisplayGUI(args.carriage)
    
    # Start CoAP observer in a background thread
    observer_thread = Thread(target=start_observer, args=(gui, args.carriage), daemon=True)
    observer_thread.start()
    
    # Run GUI main loop (blocks until window closed)
    gui.run()
