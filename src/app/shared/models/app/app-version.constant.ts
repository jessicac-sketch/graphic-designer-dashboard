/** Local Imports */
import { version } from '../../../../../package.json';

/**
 * App version shown in the UI, read from package.json at build time
 * (only the `version` field is bundled).
 */
export const APP_VERSION: string = version;
