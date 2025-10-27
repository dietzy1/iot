using backend.Resources;
using CoAP;
using CoAP.Server;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Services
{
    public class CoapServerService : IHostedService, IDisposable
    {
        private readonly CoapServer _server;
        private readonly CoapObservable _counterResource;

        public CoapServerService()
        {
            _server = new CoapServer();
            
            // Create an instance of our observable resource with path "counter"
            _counterResource = new CoapObservable("counter");
            _server.Add(_counterResource); // Add the resource to the server

            // Create root "seats" resource
            var seatsRoot = new CoAP.Server.Resources.Resource("seats");
            _server.Add(seatsRoot);

            // Register carriage resources (1..10 for now, can be dynamic based on DB)
            for (int carriageId = 1; carriageId <= 10; carriageId++)
            {
                var carriageResource = new CoapCarriageResource(carriageId);
                CoapResourceManager.RegisterCarriageResource(carriageResource, seatsRoot);
            }
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("Starting CoAP Server...");
            _server.Start(); // Start the CoAP server
            Console.WriteLine($"CoAP Server started on port {CoAP.CoapConstants.DefaultPort} (UDP).");
            Console.WriteLine("Observable resources:");
            Console.WriteLine("  - '/counter' (test counter)");
            Console.WriteLine("  - '/seats/{{carriageId}}/available' (seat availability for carriages 1-10)");
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("Stopping CoAP Server...");
            _server.Stop(); // Stop the CoAP server
            _counterResource.Dispose(); // Dispose the timer within the resource
            Console.WriteLine("CoAP Server stopped.");
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _server?.Dispose();
            _counterResource?.Dispose();
        }
    }
}