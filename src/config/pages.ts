export const productCategories = [
  { slug: "wire-rope-assemblies", title: "Wire Rope Assemblies", description: "Custom wire rope assemblies for buyers who need defined lengths, fittings, coatings and drawing-based cable configurations." },
  { slug: "tool-safety-lanyards", title: "Tool & Safety Lanyards", description: "Coiled and straight safety lanyards for tool retention, equipment tethering and custom attachment requirements." },
  { slug: "suspension-hanging-kits", title: "Suspension & Hanging Kits", description: "Cable suspension kits for lighting, panels, signs and hanging systems with grippers, loops and adjustable fittings." },
  { slug: "control-brake-cables", title: "Control & Brake Cables", description: "Bowden, push-pull, brake and throttle cable assemblies for equipment buyers who require controlled movement and fitted ends." },
  { slug: "gym-fitness-cables", title: "Gym Fitness Cables", description: "PVC coated fitness equipment cables for weight stacks and training machines, supplied to drawing or sample requirements." },
  { slug: "wire-rope-fittings", title: "Wire Rope Fittings", description: "Thimbles, sleeves, terminals, hooks, grippers and stops used with custom wire rope and cable assembly projects." }
] as const;

export const constructions = ["1x7", "1x19", "6x7", "6x19", "6x36", "7x7", "7x19", "rotation-resistant"] as const;

export const applications = [
  { slug: "marine", title: "Marine", description: "Steel wire rope sourcing for marine procurement contexts where material, coating and corrosion requirements must be confirmed." },
  { slug: "crane-and-lifting", title: "Crane and Lifting", description: "Selection framework for lifting-related inquiries. Final suitability must be verified against application requirements and standards." },
  { slug: "architectural", title: "Architectural", description: "Wire rope procurement for architectural projects where finish, diameter, fittings and documentation need confirmation." },
  { slug: "security-cables", title: "Security Cables", description: "Wire rope and coated cable sourcing for security cable assemblies and custom lengths." },
  { slug: "control-cables", title: "Control Cables", description: "Selection support for control cable sourcing where construction, flexibility and terminals are specified by drawings." },
  { slug: "fitness-equipment", title: "Fitness Equipment", description: "Wire rope procurement framework for equipment manufacturers using drawings and verified product requirements." },
  { slug: "industrial-assemblies", title: "Industrial Assemblies", description: "Custom wire rope assemblies for industrial procurement, packaging and repeat purchasing workflows." }
] as const;

export const capabilities = [
  { slug: "custom-wire-rope-assemblies", title: "Custom Wire Rope Assemblies", description: "Assembly framework for drawing-based requirements, terminals, lengths and packaging. TODO: confirm production scope." },
  { slug: "cutting", title: "Cutting", description: "Cut-to-length capability page. TODO: confirm diameter range, tolerance and equipment." },
  { slug: "swaging", title: "Swaging", description: "Swaging capability page. TODO: confirm terminal types, process range and inspection method." },
  { slug: "terminal-installation", title: "Terminal Installation", description: "Terminal installation framework for fittings and end configurations. TODO: confirm supported terminals." },
  { slug: "custom-packaging", title: "Custom Packaging", description: "Custom packaging page for procurement and distributor requirements. TODO: confirm packaging formats." }
] as const;
