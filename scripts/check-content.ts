import { readResources } from "../src/lib/content/resources";
import { readServices } from "../src/lib/services/data";

const { resources, errors } = readResources();
const { services, errors: serviceErrors } = readServices();
errors.push(...serviceErrors);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${resources.length} resource records and ${services.length} service records.`);
