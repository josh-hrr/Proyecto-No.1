document.addEventListener("DOMContentLoaded", function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("country").innerText = "Geolocalización no soportada.";
    }

    function showPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
            .then(response => response.json())
            .then(data => {
                if (data.address && data.address.country) {
                    document.getElementById("country").innerText = data.address.country;
                } else {
                    document.getElementById("country").innerText = "No disponible";
                }
            })
            .catch(error => {
                document.getElementById("country").innerText = "Error obteniendo ubicación.";
            });
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                document.getElementById("country").innerText = "Permiso denegado.";
                break;
            case error.POSITION_UNAVAILABLE:
                document.getElementById("country").innerText = "Información de ubicación no disponible.";
                break;
            case error.TIMEOUT:
                document.getElementById("country").innerText = "Tiempo de espera agotado.";
                break;
            case error.UNKNOWN_ERROR:
                document.getElementById("country").innerText = "Error desconocido.";
                break;
        }
    }
});
