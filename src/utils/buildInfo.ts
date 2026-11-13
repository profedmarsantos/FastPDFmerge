/**
 * Exposes the build version timestamp injected at compile time by Vite.
 * Format: YYYY MM AA - HH:MM
 */
export const BUILD_VERSION: string =
  typeof __APP_BUILD_VERSION__ !== 'undefined'
    ? __APP_BUILD_VERSION__
    : (() => {
        const d = new Date();
        const parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Sao_Paulo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).formatToParts(d);
        const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
        return `${map.year} ${map.month} ${map.day} - ${map.hour}:${map.minute}`;
      })();
