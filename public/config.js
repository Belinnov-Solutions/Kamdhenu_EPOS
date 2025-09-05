let appConfig = {
  API_BASE_URL: '', // default (optional)
};
 
export const loadConfig = async () => {
  try {
    const response = await fetch('/EPOSPORTAL/config.json'); // <-- Make sure this path matches your IIS deployment
    const data = await response.json();
    appConfig = { ...appConfig, ...data };
    console.log("Loaded config:", appConfig); // for debugging
  } catch (error) {
    console.error("Failed to load config.json:", error);
  }
};
 
export const getConfig = () => appConfig;