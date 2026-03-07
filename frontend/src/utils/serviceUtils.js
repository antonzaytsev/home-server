export function getServiceIcon(serviceName) {
  const name = (serviceName || '').toLowerCase();
  if (name.includes('home assistant') || name.includes('hass')) return '🏠';
  if (name.includes('plex')) return '🎬';
  if (name.includes('router') || name.includes('admin')) return '🌐';
  if (name.includes('dns')) return '🌍';
  if (name.includes('torrent') || name.includes('qbit')) return '⬇️';
  if (name.includes('jellyfin')) return '🍿';
  if (name.includes('cockpit')) return '⚙️';
  if (name.includes('portainer')) return '🐳';
  if (name.includes('calendar')) return '📅';
  if (name.includes('trading') || name.includes('charts')) return '📈';
  return '🖥️';
}

export function getServiceUrl(service) {
  if (service.url) return service.url;
  if (service.address) {
    if (service.address.startsWith('http://') || service.address.startsWith('https://')) {
      return service.address;
    }
    return `http://${service.address}${service.port ? `:${service.port}` : ''}`;
  }
  return null;
}

export function getDisplayUrl(service) {
  const url = getServiceUrl(service);
  if (!url) return 'No URL';
  return url.replace(/^https?:\/\//, '');
}
