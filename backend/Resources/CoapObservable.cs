using CoAP;
using CoAP.Server.Resources;
using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Resources
{
    public class CoapObservable : Resource, IDisposable
    {
        private int _counter = 0;
        private Timer _timer;

        public CoapObservable(string name) : base(name)
        {
            // Mark this resource as observable
            Observable = true;

            // Set some attributes for discovery (optional but good practice)
            this.Attributes.Add("ct", MediaType.TextPlain.ToString()); // Content-Type
            this.Attributes.Add("rt", "counter"); // Resource Type
            this.Attributes.Add("if", "sensor"); // Interface Description

            // Start a timer to update the counter and notify observers every second
            _timer = new Timer(async (state) => await UpdateValueAndNotify(), null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
        }

        protected override void DoGet(CoapExchange exchange)
        {
            // If the request includes the Observe option (0 for registration)
            if (exchange.Request.Observe == 0)
            {
                // Observer registration is handled automatically by CoAP.NET when Observable = true.
                Console.WriteLine($"Client {exchange.Request.Source} registered for observation on resource '{this.Path}'.");
            }

            // Respond with the current counter value
            // This is sent both for initial GET requests and subsequent observation notifications
            exchange.Respond(StatusCode.Content, _counter.ToString(), MediaType.TextPlain);
        }

        /// <summary>
        /// Increments the counter and notifies all registered observers.
        /// </summary>
        public async Task UpdateValueAndNotify()
        {
            _counter += 5;
            Console.WriteLine($"Counter updated to {_counter}. Notifying observers...");

            // Call Changed() to notify all registered observers.
            // This will internally trigger DoGet for each observer with the new value.
            Changed();
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}