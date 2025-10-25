// === QuoVadiScout v1.2.1 - Cache Bust: 2024-12-19-11-25 ===
console.log('🔄 Integrations.js caricato con versione v1.2.1 - Cache bust applicato');

// NavigationIntegrations per apertura in app mappe native
class NavigationIntegrations {
  static openInMaps(lat, lng, name) {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const android = /Android/.test(navigator.userAgent);
    
    if (iOS) {
      // Apple Maps per iOS
      const url = `maps://maps.apple.com/?q=${lat},${lng}&ll=${lat},${lng}&z=15`;
      window.open(url, '_blank');
      console.log('🍎 Apertura in Apple Maps');
    } else if (android) {
      // Google Maps per Android
      const url = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
      window.open(url, '_blank');
      console.log('🤖 Apertura in Google Maps Android');
    } else {
      // Desktop: OpenStreetMap
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
      window.open(url, '_blank');
      console.log('🌐 Apertura in OpenStreetMap');
    }
  }
  
  static async getPublicTransport(fromLat, fromLng, toLat, toLng) {
    // Implementazione semplificata per trasporto pubblico
    // In produzione, integrare con API specifiche (Moovit, Google Transit, etc.)
    
    try {
      // Esempio con API OpenRouteService (gratuita con limite)
      const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=demo&start=${fromLng},${fromLat}&end=${toLng},${toLat}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          duration: data.features[0].properties.summary.duration,
          distance: data.features[0].properties.summary.distance,
          instructions: data.features[0].properties.segments[0].steps.map(step => step.instruction)
        };
      }
    } catch (error) {
      console.warn('⚠️ Errore API trasporto pubblico:', error);
    }
    
    return null;
  }
  
  static shareLocation(lat, lng, name) {
    if (navigator.share) {
      // Web Share API se supportata
      navigator.share({
        title: `Posizione: ${name}`,
        text: `Condivido la posizione di ${name}`,
        url: `https://www.google.com/maps?q=${lat},${lng}`
      });
    } else {
      // Fallback: copia negli appunti
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      navigator.clipboard.writeText(url).then(() => {
        window.showNotification('📍 Posizione copiata', {
          body: 'L\'URL della posizione è stato copiato negli appunti',
          tag: 'location-copied'
        });
      });
    }
  }
}

// CalendarIntegrations per esportazione eventi iCal
class CalendarIntegrations {
  static formatICalDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  
  static addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }
  
  static createICalEvent(struttura, date = new Date(), duration = 2) {
    const startDate = date;
    const endDate = this.addHours(startDate, duration);
    
    const event = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//QuoVadiScout//IT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${struttura.id}@quovadiscout.app
DTSTAMP:${this.formatICalDate(new Date())}
DTSTART:${this.formatICalDate(startDate)}
DTEND:${this.formatICalDate(endDate)}
SUMMARY:Visita ${struttura.Struttura || 'Struttura'}
DESCRIPTION:${struttura.Info || ''}\\n\\nDettagli struttura:\\n- Luogo: ${struttura.Luogo}, ${struttura.Prov}\\n- Indirizzo: ${struttura.Indirizzo || 'Non specificato'}
LOCATION:${struttura.Luogo}, ${struttura.Prov}
${struttura.coordinate?.lat && struttura.coordinate?.lng ? `GEO:${struttura.coordinate.lat};${struttura.coordinate.lng}` : ''}
URL:${window.location.origin}/?structure=${struttura.id}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visita-${(struttura.Struttura || 'struttura').replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📅 Evento iCal creato:', struttura.Struttura);
    
    window.showNotification('📅 Evento aggiunto', {
      body: 'L\'evento è stato scaricato. Apri il file per aggiungerlo al tuo calendario.',
      tag: 'ical-event-created'
    });
  }
  
  static createGoogleCalendarEvent(struttura, date = new Date(), duration = 2) {
    const startDate = date;
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Visita ${struttura.Struttura || 'Struttura'}`,
      dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      details: `${struttura.Info || ''}\\n\\nDettagli struttura:\\n- Luogo: ${struttura.Luogo}, ${struttura.Prov}\\n- Indirizzo: ${struttura.Indirizzo || 'Non specificato'}`,
      location: `${struttura.Luogo}, ${struttura.Prov}`
    });
    
    const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(url, '_blank');
    
    console.log('📅 Evento Google Calendar creato:', struttura.Struttura);
  }
}

// WeatherIntegrations per informazioni meteo
class WeatherIntegrations {
  static async getWeather(lat, lng) {
    try {
      // Usa OpenWeatherMap API (richiede API key)
      // Per demo, usiamo un servizio gratuito
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,precipitation_probability&timezone=auto`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          temperature: Math.round(data.current_weather.temperature),
          description: this.getWeatherDescription(data.current_weather.weathercode),
          windSpeed: data.current_weather.windspeed,
          humidity: data.hourly.relativehumidity_2m?.[0] || null
        };
      }
    } catch (error) {
      console.warn('⚠️ Errore API meteo:', error);
    }
    
    return null;
  }
  
  static getWeatherDescription(code) {
    const descriptions = {
      0: 'Sereno',
      1: 'Poco nuvoloso',
      2: 'Parzialmente nuvoloso',
      3: 'Nuvoloso',
      45: 'Nebbia',
      48: 'Nebbia ghiacciata',
      51: 'Pioggerella leggera',
      53: 'Pioggerella moderata',
      55: 'Pioggerella intensa',
      61: 'Pioggia leggera',
      63: 'Pioggia moderata',
      65: 'Pioggia intensa',
      71: 'Neve leggera',
      73: 'Neve moderata',
      75: 'Neve intensa'
    };
    
    return descriptions[code] || 'Condizioni sconosciute';
  }
}

// SocialIntegrations per condivisione social
class SocialIntegrations {
  static shareOnFacebook(struttura) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/?structure=' + struttura.id)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }
  
  static shareOnTwitter(struttura) {
    const text = `Ho trovato questa interessante struttura: ${struttura.Struttura} a ${struttura.Luogo}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin + '/?structure=' + struttura.id)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }
  
  static shareOnWhatsApp(struttura) {
    const text = `Ciao! Ho trovato questa interessante struttura: ${struttura.Struttura} a ${struttura.Luogo}. Guarda qui: ${window.location.origin}/?structure=${struttura.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}

// Crea istanze globali
window.navigationIntegrations = NavigationIntegrations;
window.calendarIntegrations = CalendarIntegrations;
window.weatherIntegrations = WeatherIntegrations;
window.socialIntegrations = SocialIntegrations;

// Funzioni di utilità globali
window.openInMaps = (lat, lng, name) => NavigationIntegrations.openInMaps(lat, lng, name);
window.createICalEvent = (struttura, date, duration) => CalendarIntegrations.createICalEvent(struttura, date, duration);
window.createGoogleCalendarEvent = (struttura, date, duration) => CalendarIntegrations.createGoogleCalendarEvent(struttura, date, duration);
window.shareLocation = (lat, lng, name) => NavigationIntegrations.shareLocation(lat, lng, name);

console.log('🔄 Integrations Manager inizializzato');
