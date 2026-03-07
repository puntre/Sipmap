document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([40.7128, -74.0060], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    const feedbackMessage = document.getElementById('feedback-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    const addDispenserForm = document.getElementById('add-dispenser-form');
    const addRatingForm = document.getElementById('add-rating-form');
    const isPaidCheckbox = document.getElementById('is_paid');
    const priceGroup = document.getElementById('price-group');
    const addressSearch = document.getElementById('address-search');
    const addressSuggestions = document.getElementById('address-suggestions');

    isPaidCheckbox.addEventListener('change', () => {
        priceGroup.classList.toggle('hidden', !isPaidCheckbox.checked);
    });

    function showMessage(msg, type) {
        feedbackMessage.textContent = msg;
        feedbackMessage.className = type;
        setTimeout(() => { feedbackMessage.className = 'hidden'; }, 3000);
    }

    function toggleLoading(show) {
        loadingIndicator.classList.toggle('hidden', !show);
    }

    async function loadDispensers() {
        toggleLoading(true);
        try {
            const response = await fetch('/api/dispensers');
            if (!response.ok) throw new Error('Failed to fetch');
            const dispensers = await response.json();
            markersLayer.clearLayers();
            dispensers.forEach(d => {
                const avgScore = parseFloat(d.avg_cleanliness_score).toFixed(1);
                const badge = d.is_paid
                    ? `<span class="badge paid">Paid ($${parseFloat(d.price).toFixed(2)})</span>`
                    : `<span class="badge free">Free</span>`;
                const popup = `
                    <div class="popup-content">
                        <h3>Dispenser #${d.id}</h3>
                        <p>${d.location_description}</p>
                        <p><strong>Added by:</strong> ${d.added_by_username}</p>
                        <p><strong>Cleanliness:</strong> ${avgScore} / 5.0</p>
                        <p>${badge}</p>
                        <button class="delete-btn" data-id="${d.id}">Delete</button>
                    </div>
                `;
                L.marker([d.latitude, d.longitude]).bindPopup(popup).addTo(markersLayer);
            });
        } catch (error) {
            showMessage('Error loading dispensers', 'error');
        } finally {
            toggleLoading(false);
        }
    }

    addDispenserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        toggleLoading(true);
        const payload = {
            latitude: parseFloat(document.getElementById('lat').value),
            longitude: parseFloat(document.getElementById('lng').value),
            description: document.getElementById('desc').value,
            is_paid: isPaidCheckbox.checked,
            price: isPaidCheckbox.checked ? parseFloat(document.getElementById('price').value) : 0,
            user_id: parseInt(document.getElementById('user_id').value)
        };
        try {
            const response = await fetch('/api/dispensers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to add');
            showMessage('Dispenser added!', 'success');
            addDispenserForm.reset();
            addressSearch.value = '';
            priceGroup.classList.add('hidden');
            if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
            loadDispensers();
        } catch (error) {
            showMessage('Error adding dispenser', 'error');
        } finally {
            toggleLoading(false);
        }
    });

    addRatingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        toggleLoading(true);
        const payload = {
            dispenser_id: parseInt(document.getElementById('dispenser_id').value),
            user_id: parseInt(document.getElementById('rating_user_id').value),
            cleanliness_score: parseInt(document.getElementById('score').value),
            review_text: document.getElementById('review').value
        };
        try {
            const response = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to rate');
            showMessage('Rating submitted!', 'success');
            addRatingForm.reset();
            loadDispensers();
        } catch (error) {
            showMessage('Error submitting rating', 'error');
        } finally {
            toggleLoading(false);
        }
    });

    let tempMarker = null;

    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById('lat').value = lat.toFixed(6);
        document.getElementById('lng').value = lng.toFixed(6);
        if (tempMarker) { tempMarker.setLatLng(e.latlng); }
        else { tempMarker = L.marker(e.latlng, { zIndexOffset: 1000 }).addTo(map); }
        showMessage('Coordinates captured!', 'success');
    });

    let debounceTimer;
    addressSearch.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = addressSearch.value.trim();
        if (query.length < 3) { addressSuggestions.classList.add('hidden'); return; }
        debounceTimer = setTimeout(async () => {
            try {
                addressSuggestions.innerHTML = '<div class="suggestion-item">Searching...</div>';
                addressSuggestions.classList.remove('hidden');
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&q=${encodeURIComponent(query)}&limit=10`);
                const data = await response.json();
                if (data.length > 0) {
                    addressSuggestions.innerHTML = '';
                    data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        div.textContent = item.display_name;
                        div.addEventListener('click', () => {
                            const lat = parseFloat(item.lat);
                            const lon = parseFloat(item.lon);
                            document.getElementById('lat').value = lat.toFixed(6);
                            document.getElementById('lng').value = lon.toFixed(6);
                            map.setView([lat, lon], 17);
                            if (tempMarker) { tempMarker.setLatLng([lat, lon]); }
                            else { tempMarker = L.marker([lat, lon], { zIndexOffset: 1000 }).addTo(map); }
                            addressSearch.value = item.display_name;
                            addressSuggestions.classList.add('hidden');
                        });
                        addressSuggestions.appendChild(div);
                    });
                } else {
                    addressSuggestions.innerHTML = '<div class="suggestion-item">No results found</div>';
                }
            } catch (error) {
                addressSuggestions.innerHTML = '<div class="suggestion-item">Error fetching results</div>';
            }
        }, 600);
    });

    document.addEventListener('click', (e) => {
        if (!addressSearch.contains(e.target) && !addressSuggestions.contains(e.target)) {
            addressSuggestions.classList.add('hidden');
        }
    });

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            if (id) await window.deleteDispenser(id);
        }
    });

    window.deleteDispenser = async (id) => {
        if (!confirm('Delete this dispenser?')) return;
        toggleLoading(true);
        try {
            const response = await fetch(`/api/dispensers/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to delete');
            map.closePopup();
            showMessage('Dispenser deleted!', 'success');
            setTimeout(() => loadDispensers(), 100);
        } catch (error) {
            showMessage(`Error: ${error.message}`, 'error');
        } finally {
            toggleLoading(false);
        }
    };

    loadDispensers();
});
