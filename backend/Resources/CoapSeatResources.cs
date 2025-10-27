using CoAP;
using CoAP.Server.Resources;
using System;
using System.Collections.Concurrent;

namespace backend.Resources
{
    /// <summary>
    /// Observable resource that returns available seats as plain text
    /// </summary>
    public class CoapAvailableResource : Resource
    {
        private string _payload = "0";

        public CoapAvailableResource() : base("available")
        {
            Observable = true;
            this.Attributes.Add("ct", MediaType.TextPlain.ToString());
            this.Attributes.Add("rt", "available-seats");
            this.Attributes.Add("if", "sensor");
        }

        protected override void DoGet(CoapExchange exchange)
        {
            exchange.Respond(StatusCode.Content, _payload, MediaType.TextPlain);
        }

        public void Update(int availableSeats)
        {
            _payload = availableSeats.ToString();
            Changed(); // notify all observers
        }
    }

    /// <summary>
    /// Carriage resource that contains an 'available' child resource
    /// </summary>
    public class CoapCarriageResource : Resource
    {
        public int CarriageId { get; }
        public CoapAvailableResource AvailableResource { get; }

        public CoapCarriageResource(int carriageId) : base(carriageId.ToString())
        {
            CarriageId = carriageId;
            AvailableResource = new CoapAvailableResource();
            Add(AvailableResource);
        }
    }

    /// <summary>
    /// Manages CoAP carriage resources and dispatches seat availability notifications
    /// </summary>
    public static class CoapResourceManager
    {
        private static readonly ConcurrentDictionary<int, CoapCarriageResource> _carriageResources = new();

        /// <summary>
        /// Registers a carriage resource with the CoAP server
        /// </summary>
        public static void RegisterCarriageResource(CoapCarriageResource resource, Resource parent)
        {
            if (_carriageResources.TryAdd(resource.CarriageId, resource))
            {
                parent.Add(resource);
            }
        }

        /// <summary>
        /// Called by SeatService after DB update to notify CoAP observers
        /// </summary>
        public static void NotifySeatUpdate(int carriageId, int availableSeats)
        {
            if (_carriageResources.TryGetValue(carriageId, out var carriageRes))
            {
                carriageRes.AvailableResource.Update(availableSeats);
            }
        }
    }
}
