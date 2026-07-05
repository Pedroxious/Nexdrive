/**
 * RentCars - Frontend Application
 * Integração com API REST do backend Spring Boot
 */

// API Base URL
const API_BASE = '/api';

// State
let categories = [];
let vehicles = [];
let suppliers = [];
let selectedVehicle = null;

// DOM Elements
const categoriesCarousel = document.getElementById('categoriesCarousel');
const vehiclesGrid = document.getElementById('vehiclesGrid');
const bookingModal = document.getElementById('bookingModal');
const closeModal = document.getElementById('closeModal');
const bookingForm = document.getElementById('bookingForm');
const filterTabs = document.querySelectorAll('.filter-tab');

// =====================================================
// API Functions
// =====================================================

async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

async function fetchVehicles(categoryId = null) {
    try {
        let url = `${API_BASE}/vehicles`;
        if (categoryId) {
            url = `${API_BASE}/vehicles/category/${categoryId}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        vehicles = await response.json();
        return vehicles;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return [];
    }
}

async function fetchSuppliers() {
    try {
        const response = await fetch(`${API_BASE}/suppliers`);
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        suppliers = await response.json();
        return suppliers;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return [];
    }
}

async function searchVehicles(query) {
    try {
        const response = await fetch(`${API_BASE}/vehicles/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to search vehicles');
        return await response.json();
    } catch (error) {
        console.error('Error searching vehicles:', error);
        return [];
    }
}

// =====================================================
// Render Functions
// =====================================================

function renderCategories(categoriesData) {
    if (!categoriesCarousel) return;

    if (!categoriesData || categoriesData.length === 0) {
        categoriesCarousel.innerHTML = '<p class="no-data">Nenhuma categoria disponível</p>';
        return;
    }

    // Group vehicles by category
    const vehiclesByCategory = {};
    vehicles.forEach(v => {
        if (!vehiclesByCategory[v.categoryId]) {
            vehiclesByCategory[v.categoryId] = [];
        }
        vehiclesByCategory[v.categoryId].push(v);
    });

    categoriesCarousel.innerHTML = categoriesData.map(category => {
        const categoryVehicles = vehiclesByCategory[category.id] || [];
        const supplierPrices = getSupplierPrices(categoryVehicles);

        return `
            <div class="category-card fade-in" data-category-id="${category.id}">
                <span class="category-badge">foco</span>
                <div class="category-image">
                    <img src="${getCategoryImage(category.name)}" alt="${category.name}" 
                         onerror="this.src='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'">
                </div>
                <h3 class="category-name">${category.name}</h3>
                <div class="category-price">
                    <span>A partir de R$ ${formatPrice(category.minPrice)}/dia</span>
                    <button class="btn-view" onclick="filterByCategory(${category.id})">Ver mais</button>
                </div>
                <div class="category-suppliers">
                    ${supplierPrices.slice(0, 3).map(sp => `
                        <div class="supplier-row">
                            <span class="price">R$ ${formatPrice(sp.price)} na ${sp.name}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m9 18 6-6-6-6"></path>
                            </svg>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderVehicles(vehiclesData) {
    if (!vehiclesGrid) return;

    if (!vehiclesData || vehiclesData.length === 0) {
        vehiclesGrid.innerHTML = '<p class="no-data">Nenhum veículo disponível</p>';
        return;
    }

    vehiclesGrid.innerHTML = vehiclesData.map(vehicle => `
        <div class="vehicle-card fade-in" data-vehicle-id="${vehicle.id}">
            <div class="vehicle-image">
                ${vehicle.supplierName === 'Foco' ? '<span class="vehicle-badge">Destaque</span>' : ''}
                <img src="${vehicle.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'}" 
                     alt="${vehicle.name}"
                     onerror="this.src='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'">
            </div>
            <div class="vehicle-info">
                <span class="vehicle-category">${vehicle.categoryName || 'Veículo'}</span>
                <h3 class="vehicle-name">${vehicle.name}</h3>
                <div class="vehicle-specs">
                    <span class="vehicle-spec">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                        </svg>
                        ${vehicle.transmission || 'Manual'}
                    </span>
                    <span class="vehicle-spec">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        ${vehicle.seats || 5} lugares
                    </span>
                    <span class="vehicle-spec">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        ${vehicle.doors || 4} portas
                    </span>
                    ${vehicle.airConditioning ? `
                        <span class="vehicle-spec">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 16a4 4 0 1 0 8 0c0-2-2-3-4-4s-4-2-4-4a4 4 0 1 1 8 0"></path>
                            </svg>
                            Ar-cond.
                        </span>
                    ` : ''}
                </div>
                <div class="vehicle-footer">
                    <div class="vehicle-price">
                        <span class="label">A partir de</span>
                        <span class="value">R$ ${formatPrice(vehicle.pricePerDay)}<span class="period">/dia</span></span>
                    </div>
                    <button class="btn-rent" onclick="openBookingModal(${vehicle.id})">Alugar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderLoadingCategories() {
    if (!categoriesCarousel) return;
    categoriesCarousel.innerHTML = Array(4).fill(`
        <div class="category-card">
            <div class="skeleton" style="width: 60px; height: 24px; margin-bottom: 16px;"></div>
            <div class="skeleton" style="width: 100%; height: 120px; margin-bottom: 16px;"></div>
            <div class="skeleton" style="width: 80%; height: 24px; margin-bottom: 8px;"></div>
            <div class="skeleton" style="width: 100%; height: 40px; margin-bottom: 16px;"></div>
            <div class="skeleton" style="width: 100%; height: 100px;"></div>
        </div>
    `).join('');
}

function renderLoadingVehicles() {
    if (!vehiclesGrid) return;
    vehiclesGrid.innerHTML = Array(8).fill(`
        <div class="vehicle-card">
            <div class="skeleton" style="height: 180px;"></div>
            <div style="padding: 20px;">
                <div class="skeleton" style="width: 60px; height: 16px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 80%; height: 24px; margin-bottom: 16px;"></div>
                <div class="skeleton" style="width: 100%; height: 32px; margin-bottom: 16px;"></div>
                <div class="skeleton" style="width: 100%; height: 48px;"></div>
            </div>
        </div>
    `).join('');
}

// =====================================================
// Helper Functions
// =====================================================

function formatPrice(price) {
    if (price === null || price === undefined) return '0';
    return Number(price).toFixed(0);
}

function getCategoryImage(categoryName) {
    const images = {
        'Econômico': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
        'Compacto': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400',
        'Minivan': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400',
        'SUV': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400'
    };
    return images[categoryName] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400';
}

function getSupplierPrices(categoryVehicles) {
    const supplierMap = {};
    categoryVehicles.forEach(v => {
        if (!supplierMap[v.supplierName] || v.pricePerDay < supplierMap[v.supplierName]) {
            supplierMap[v.supplierName] = v.pricePerDay;
        }
    });

    return Object.entries(supplierMap)
        .map(([name, price]) => ({ name, price }))
        .sort((a, b) => a.price - b.price);
}

function calculateDays(startDate, endDate) {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
}

// =====================================================
// Event Handlers
// =====================================================

function filterByCategory(categoryId) {
    // Update active tab
    filterTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === String(categoryId) ||
            (categoryId === 'all' && tab.dataset.category === 'all')) {
            tab.classList.add('active');
        }
    });

    // Scroll to vehicles section
    document.querySelector('.vehicles-section').scrollIntoView({ behavior: 'smooth' });

    // Fetch and render vehicles
    if (categoryId === 'all') {
        fetchVehicles().then(renderVehicles);
    } else {
        fetchVehicles(categoryId).then(renderVehicles);
    }
}

function openBookingModal(vehicleId) {
    selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (!selectedVehicle) return;

    // Populate modal with vehicle info
    const modalInfo = document.getElementById('modalVehicleInfo');
    if (modalInfo) {
        modalInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 16px; background: #f8f9fa; border-radius: 12px;">
                <img src="${selectedVehicle.imageUrl}" alt="${selectedVehicle.name}" 
                     style="width: 120px; height: 80px; object-fit: contain;"
                     onerror="this.src='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'">
                <div>
                    <h4 style="font-size: 18px; margin-bottom: 4px;">${selectedVehicle.name}</h4>
                    <p style="color: #6b7280; font-size: 14px;">${selectedVehicle.categoryName} • ${selectedVehicle.supplierName}</p>
                    <p style="font-weight: 600; color: #1a1a1a;">R$ ${formatPrice(selectedVehicle.pricePerDay)}/dia</p>
                </div>
            </div>
        `;
    }

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pickupDateInput = document.getElementById('modalPickupDate');
    const returnDateInput = document.getElementById('modalReturnDate');

    if (pickupDateInput) pickupDateInput.value = today.toISOString().split('T')[0];
    if (returnDateInput) returnDateInput.value = tomorrow.toISOString().split('T')[0];

    updateBookingSummary();

    // Show modal
    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    bookingModal.classList.remove('active');
    document.body.style.overflow = '';
    selectedVehicle = null;
}

function updateBookingSummary() {
    if (!selectedVehicle) return;

    const pickupDate = document.getElementById('modalPickupDate')?.value;
    const returnDate = document.getElementById('modalReturnDate')?.value;
    const days = calculateDays(pickupDate, returnDate);
    const totalPrice = selectedVehicle.pricePerDay * days;

    const summaryEl = document.getElementById('bookingSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="summary-row">
                <span>Diária (R$ ${formatPrice(selectedVehicle.pricePerDay)} × ${days} dias)</span>
                <span>R$ ${formatPrice(totalPrice)}</span>
            </div>
            <div class="summary-row">
                <span>Taxa de serviço</span>
                <span>Grátis</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>R$ ${formatPrice(totalPrice)}</span>
            </div>
        `;
    }
}

// =====================================================
// Event Listeners
// =====================================================

// Filter tabs
filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const categoryId = tab.dataset.category;
        filterByCategory(categoryId === 'all' ? 'all' : parseInt(categoryId));
    });
});

// Modal events
if (closeModal) {
    closeModal.addEventListener('click', closeBookingModal);
}

if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal?.classList.contains('active')) {
        closeBookingModal();
    }
});

// Date inputs update summary
document.getElementById('modalPickupDate')?.addEventListener('change', updateBookingSummary);
document.getElementById('modalReturnDate')?.addEventListener('change', updateBookingSummary);

// Booking form submission
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedVehicle) return;

        const formData = {
            userName: document.getElementById('userName')?.value,
            userEmail: document.getElementById('userEmail')?.value,
            pickupDate: document.getElementById('modalPickupDate')?.value,
            returnDate: document.getElementById('modalReturnDate')?.value,
            pickupLocation: document.getElementById('modalPickupLocation')?.value,
            vehicleId: selectedVehicle.id
        };

        // Here you would normally send this to the backend
        console.log('Booking data:', formData);

        // Show success message
        alert(`Reserva confirmada!\n\nVeículo: ${selectedVehicle.name}\nRetirada: ${formData.pickupDate}\nDevolução: ${formData.returnDate}\n\nVocê receberá um e-mail de confirmação em ${formData.userEmail}`);

        closeBookingModal();
        bookingForm.reset();
    });
}

// Search form
const searchVehiclesBtn = document.getElementById('searchVehicles');
const pickupLocationInput = document.getElementById('pickupLocation');

if (searchVehiclesBtn) {
    searchVehiclesBtn.addEventListener('click', async () => {
        const query = pickupLocationInput?.value?.trim();
        if (query) {
            const results = await searchVehicles(query);
            renderVehicles(results.length > 0 ? results : vehicles);
            document.querySelector('.vehicles-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            document.querySelector('.vehicles-section').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Carousel navigation
const prevCategoryBtn = document.getElementById('prevCategory');
const nextCategoryBtn = document.getElementById('nextCategory');

if (prevCategoryBtn && categoriesCarousel) {
    prevCategoryBtn.addEventListener('click', () => {
        categoriesCarousel.scrollBy({ left: -300, behavior: 'smooth' });
    });
}

if (nextCategoryBtn && categoriesCarousel) {
    nextCategoryBtn.addEventListener('click', () => {
        categoriesCarousel.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

// =====================================================
// Initialize Application
// =====================================================

async function initApp() {
    console.log('🚗 Initializing RentCars App...');

    // Show loading states
    renderLoadingCategories();
    renderLoadingVehicles();

    try {
        // Fetch all data in parallel
        const [categoriesData, vehiclesData, suppliersData] = await Promise.all([
            fetchCategories(),
            fetchVehicles(),
            fetchSuppliers()
        ]);

        console.log('📦 Data loaded:', {
            categories: categoriesData.length,
            vehicles: vehiclesData.length,
            suppliers: suppliersData.length
        });

        // Store in state
        categories = categoriesData;
        vehicles = vehiclesData;
        suppliers = suppliersData;

        // Render UI
        renderCategories(categoriesData);
        renderVehicles(vehiclesData);

        console.log('✅ RentCars App initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing app:', error);

        // Show error state
        if (categoriesCarousel) {
            categoriesCarousel.innerHTML = '<p class="no-data">Erro ao carregar categorias. Tente novamente mais tarde.</p>';
        }
        if (vehiclesGrid) {
            vehiclesGrid.innerHTML = '<p class="no-data">Erro ao carregar veículos. Tente novamente mais tarde.</p>';
        }
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
