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
    /// Coach resource that contains an 'available' child resource
    /// </summary>
    public class CoapCoachResource : Resource
    {
        public int CoachId { get; }
        public CoapAvailableResource AvailableResource { get; }

        public CoapCoachResource(int coachId) : base(coachId.ToString())
        {
            CoachId = coachId;
            AvailableResource = new CoapAvailableResource();
            Add(AvailableResource);
        }
    }

    /// <summary>
    /// Manages CoAP coach resources and dispatches seat availability notifications
    /// </summary>
    public static class CoapResourceManager
    {
        private static readonly ConcurrentDictionary<int, CoapCoachResource> _coachResources = new();

        /// <summary>
        /// Registers a coach resource with the CoAP server
        /// </summary>
        public static void RegisterCoachResource(CoapCoachResource resource, Resource parent)
        {
            if (_coachResources.TryAdd(resource.CoachId, resource))
            {
                parent.Add(resource);
            }
        }

        /// <summary>
        /// Called by SeatService after DB update to notify CoAP observers
        /// </summary>
        public static void NotifySeatUpdate(int coachId, int availableSeats)
        {
            if (_coachResources.TryGetValue(coachId, out var coachRes))
            {
                coachRes.AvailableResource.Update(availableSeats);
            }
        }
    }
}
