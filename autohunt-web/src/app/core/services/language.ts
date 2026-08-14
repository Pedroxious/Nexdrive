import { Injectable, signal, computed } from '@angular/core';

export type Language = 'pt' | 'en';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  pt: {
    // ── Navigation & Header ──
    'nav.home': 'Início',
    'nav.rent': 'Alugar',
    'nav.buy': 'Comprar',
    'nav.about': 'Sobre',
    'nav.sell_car': 'Anunciar Veículo',
    'nav.login': 'Entrar',
    'nav.register': 'Cadastrar',
    'nav.profile': 'Meu Perfil',
    'nav.my_rentals': 'Minhas Reservas',
    'nav.favorites': 'Favoritos',
    'nav.logout': 'Sair',
    'nav.all_cities': 'Todas as cidades',
    'nav.select_city': 'Selecione a cidade',
    'nav.language': 'Idioma',
    'nav.toggle_theme': 'Alternar tema',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contato',
    'nav.notifications': 'Notificações',
    'nav.view_all': 'Ver todas',

    // ── Hero & Search ──
    'hero.badge': '🚀 Plataforma #1 em Mobilidade Premium',
    'hero.title_part1': 'A liberdade de dirigir os',
    'hero.title_accent': 'melhores veículos',
    'hero.title_part2': 'do Brasil',
    'hero.subtitle': 'Reserve em minutos com frota higienizada, cobertura completa e suporte 24h em todas as capitais.',
    'search.category_all': 'Todas as categorias',
    'search.city_placeholder': 'Para onde você vai?',
    'search.dates': 'Retirada e Devolução',
    'search.button': 'Buscar veículos',
    'search.placeholder': 'Buscar por marca, modelo ou categoria...',

    // ── Categories & Badges ──
    'cat.ECONOMY': 'Econômico',
    'cat.COMPACT': 'Compacto',
    'cat.INTERMEDIATE': 'Intermediário',
    'cat.SUV': 'SUV',
    'cat.VAN': 'Picape / Utilitário',
    'cat.LUXURY': 'Luxo',
    'cat.SPORT': 'Esportivo',
    'cat.SEDAN': 'Sedã',
    'cat.HATCH': 'Hatch',
    'cat.PICKUP': 'Picape',

    'badge.BEST_SELLER': 'Mais Reservado',
    'badge.HOT_DEAL': 'Oferta Especial',
    'badge.NEW_RELEASE': 'Lançamento',
    'badge.FULL_ELECTRIC': '100% Elétrico',

    // ── Specs & Features ──
    'spec.automatic': 'Automático',
    'spec.manual': 'Manual',
    'spec.cvt': 'CVT',
    'spec.flex': 'Flex',
    'spec.gasoline': 'Gasolina',
    'spec.diesel': 'Diesel',
    'spec.electric': 'Elétrico',
    'spec.hybrid': 'Híbrido',
    'spec.ethanol': 'Etanol',
    'spec.seats': 'lugares',
    'spec.doors': 'portas',
    'spec.per_day': '/dia',
    'spec.per_month': '/mês',
    'spec.km': 'km',

    // ── Actions & Buttons ──
    'btn.rent_now': 'Alugar agora',
    'btn.buy_now': 'Comprar veículo',
    'btn.view_details': 'Ver detalhes',
    'btn.filter': 'Filtrar',
    'btn.clear_filters': 'Limpar filtros',
    'btn.clear_all': 'Limpar tudo',
    'btn.generate_ai': '✨ Gerar descrição com IA',
    'btn.generate_ai_again': '🔄 Gerar outra versão',
    'btn.confirm_booking': 'Confirmar Reserva',
    'btn.cancel': 'Cancelar',
    'btn.back': 'Voltar',
    'btn.next': 'Avançar',
    'btn.save': 'Salvar alterações',
    'btn.build_plan': 'Monte seu plano',
    'btn.favorite': 'Favoritar',
    'btn.saved': 'Salvo',

    // ── Car Detail Page ──
    'detail.back': 'Voltar ao Marketplace',
    'detail.image_soon': 'Imagem em breve',
    'detail.image_soon_desc': 'Esta vista de ângulo estará disponível em breve.',
    'detail.thumb_soon': 'Em breve',
    'detail.about_vehicle': 'Sobre o Veículo',
    'detail.available_in': 'Disponível em',
    'detail.tech_sheet': 'Ficha Técnica',
    'detail.monthly_from': 'Mensalidade a partir de',
    'detail.or_daily': 'Ou {price}/dia para aluguel avulso',
    'detail.buy_for': 'Comprar veículo por',
    'detail.condition_new': 'Novo',
    'detail.condition_used': 'Seminovo',
    'detail.recommended': 'Recomendados para você',
    'detail.no_related': 'Nenhum veículo similar encontrado no momento.',
    'detail.benefits_title': 'Vantagens Inclusas',
    'detail.benefit_ipva': 'IPVA e Licenciamento 100% pagos',
    'detail.benefit_maintenance': 'Manutenção preventiva inclusa',
    'detail.benefit_protection': 'Proteção contra colisões e terceiros',
    'detail.benefit_assistance': 'Assistência técnica 24 horas',

    // ── Spec Labels (detail page) ──
    'spec_label.engine': 'Motorização',
    'spec_label.transmission': 'Transmissão',
    'spec_label.capacity': 'Capacidade',
    'spec_label.occupants': 'ocupantes',
    'spec_label.doors': 'Portas',
    'spec_label.brand': 'Marca',
    'spec_label.model': 'Modelo',
    'spec_label.year': 'Ano',
    'spec_label.category': 'Categoria',
    'spec_label.color': 'Cor',
    'spec_label.fuel': 'Combustível',
    'spec_label.gearbox': 'Câmbio',
    'spec_label.seats': 'Lugares',
    'spec_label.mileage': 'Quilometragem',
    'spec_label.air_conditioning': 'Ar Condicionado',
    'spec_label.test_drive': 'Test Drive Grátis',
    'spec_label.condition': 'Condição',
    'spec_label.status': 'Status',
    'spec_label.available': 'Disponível',
    'spec_label.unavailable': 'Indisponível',
    'spec_label.yes': 'Sim',
    'spec_label.no': 'Não',

    // ── Colors ──
    'color.White': 'Branco',
    'color.Black': 'Preto',
    'color.Silver': 'Prata',
    'color.Red': 'Vermelho',
    'color.Blue': 'Azul',
    'color.Gray': 'Cinza',
    'color.Grey': 'Cinza',
    'color.Green': 'Verde',
    'color.Yellow': 'Amarelo',
    'color.Orange': 'Laranja',
    'color.Brown': 'Marrom',
    'color.Beige': 'Bege',

    // ── Car Card & Detail (shared) ──
    'car.daily_from': 'Diária a partir de',
    'car.sale_price': 'Preço de venda',
    'car.free_test_drive': 'Test-drive gratuito',
    'car.available_now': 'Disponível para entrega imediata',
    'car.location': 'Localização',
    'car.specifications': 'Especificações Técnicas',
    'car.description': 'Descrição do Veículo',
    'car.protection_included': 'Proteção básica inclusa',

    // ── Fees & Taxes ──
    'fee.title': 'Taxas e Opções de Proteção',
    'fee.protection_basic': 'Proteção Básica CDW (Roubo/Avarias)',
    'fee.protection_super': 'Proteção Super Isenção Total de Franquia',
    'fee.additional_driver': 'Condutor Adicional',
    'fee.extra_km': 'Quilometragem Excedente',
    'fee.return_diff_city': 'Taxa de Retorno (Outra Cidade)',
    'fee.included': 'Incluso',
    'fee.optional': 'Opcional',

    // ── Footer ──
    'footer.tagline': 'A maior e melhor plataforma de reserva de veículos do Brasil. Experiência premium em cada quilômetro.',
    'footer.company': 'Empresa',
    'footer.about': 'Sobre nós',
    'footer.sell': 'Anunciar Veículo',
    'footer.blog': 'Blog',
    'footer.partners': 'Parceiros',
    'footer.support': 'Suporte',
    'footer.help': 'Central de Ajuda',
    'footer.contact': 'Contato',
    'footer.privacy': 'Privacidade',
    'footer.terms': 'Termos de Uso',
    'footer.newsletter': 'Newsletter',
    'footer.newsletter_desc': 'Receba ofertas exclusivas e novidades.',
    'footer.email_placeholder': 'Seu melhor e-mail',
    'footer.rights': 'Todos os direitos reservados.',
    'footer.secure_conn': 'Conexão Segura SSL 256-bit',

    // ── Filters ──
    'filter.title': 'Filtros',
    'filter.vehicle_type': 'Tipo de Veículo',
    'filter.all': 'Todos',
    'filter.new': 'Novos',
    'filter.used': 'Seminovos',
    'filter.brands': 'Marcas',
    'filter.daily_price': 'Preço Diária',
    'filter.up_to': 'Até',
    'filter.category': 'Categoria',
    'filter.transmission': 'Transmissão',
    'filter.fuel': 'Combustível',
    'filter.extras': 'Diferenciais',
    'filter.free_test_drive': 'Free Test Drive',
    'filter.max_price': 'Preço máximo diária',
    'filter.sort_by': 'Ordenar por',
    'filter.sort_lowest': 'Menor preço',
    'filter.sort_highest': 'Maior preço',
    'filter.sort_newest': 'Mais recentes',

    // ── Toast Messages ──
    'toast.login_to_favorite': 'Faça login para favoritar',
    'toast.wishlist_updated': 'Lista de desejos atualizada',
    'toast.login_to_buy': 'Faça login para comprar',
    'toast.interest_registered': 'Interesse registrado! Entraremos em contato sobre o',
    'toast.login_to_favorite_vehicles': 'Faça login para favoritar veículos'
  },
  en: {
    // ── Navigation & Header ──
    'nav.home': 'Home',
    'nav.rent': 'Rent',
    'nav.buy': 'Buy',
    'nav.about': 'About',
    'nav.sell_car': 'List Vehicle',
    'nav.login': 'Sign In',
    'nav.register': 'Sign Up',
    'nav.profile': 'My Profile',
    'nav.my_rentals': 'My Bookings',
    'nav.favorites': 'Favorites',
    'nav.logout': 'Sign Out',
    'nav.all_cities': 'All cities',
    'nav.select_city': 'Select city',
    'nav.language': 'Language',
    'nav.toggle_theme': 'Toggle theme',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.notifications': 'Notifications',
    'nav.view_all': 'View all',

    // ── Hero & Search ──
    'hero.badge': '🚀 #1 Premium Mobility Platform',
    'hero.title_part1': 'The freedom to drive the',
    'hero.title_accent': 'best vehicles',
    'hero.title_part2': 'in Brazil',
    'hero.subtitle': 'Book in minutes with disinfected fleet, full coverage, and 24/7 support across all major cities.',
    'search.category_all': 'All categories',
    'search.city_placeholder': 'Where are you going?',
    'search.dates': 'Pick-up & Drop-off',
    'search.button': 'Search vehicles',
    'search.placeholder': 'Search by make, model or category...',

    // ── Categories & Badges ──
    'cat.ECONOMY': 'Economy',
    'cat.COMPACT': 'Compact',
    'cat.INTERMEDIATE': 'Intermediate',
    'cat.SUV': 'SUV',
    'cat.VAN': 'Pickup / Van',
    'cat.LUXURY': 'Luxury',
    'cat.SPORT': 'Sport',
    'cat.SEDAN': 'Sedan',
    'cat.HATCH': 'Hatchback',
    'cat.PICKUP': 'Pickup',

    'badge.BEST_SELLER': 'Best Seller',
    'badge.HOT_DEAL': 'Special Offer',
    'badge.NEW_RELEASE': 'New Release',
    'badge.FULL_ELECTRIC': '100% Electric',

    // ── Specs & Features ──
    'spec.automatic': 'Automatic',
    'spec.manual': 'Manual',
    'spec.cvt': 'CVT',
    'spec.flex': 'Flex Fuel',
    'spec.gasoline': 'Gasoline',
    'spec.diesel': 'Diesel',
    'spec.electric': 'Electric',
    'spec.hybrid': 'Hybrid',
    'spec.ethanol': 'Ethanol',
    'spec.seats': 'seats',
    'spec.doors': 'doors',
    'spec.per_day': '/day',
    'spec.per_month': '/mo',
    'spec.km': 'km',

    // ── Actions & Buttons ──
    'btn.rent_now': 'Rent now',
    'btn.buy_now': 'Buy vehicle',
    'btn.view_details': 'View details',
    'btn.filter': 'Filter',
    'btn.clear_filters': 'Clear filters',
    'btn.clear_all': 'Clear all',
    'btn.generate_ai': '✨ Generate description with AI',
    'btn.generate_ai_again': '🔄 Generate another version',
    'btn.confirm_booking': 'Confirm Booking',
    'btn.cancel': 'Cancel',
    'btn.back': 'Back',
    'btn.next': 'Next',
    'btn.save': 'Save changes',
    'btn.build_plan': 'Build your plan',
    'btn.favorite': 'Favorite',
    'btn.saved': 'Saved',

    // ── Car Detail Page ──
    'detail.back': 'Back to Marketplace',
    'detail.image_soon': 'Image coming soon',
    'detail.image_soon_desc': 'This angle view will be available soon.',
    'detail.thumb_soon': 'Soon',
    'detail.about_vehicle': 'About the Vehicle',
    'detail.available_in': 'Available in',
    'detail.tech_sheet': 'Technical Specifications',
    'detail.monthly_from': 'Monthly rate from',
    'detail.or_daily': 'Or {price}/day for single rental',
    'detail.buy_for': 'Buy this vehicle for',
    'detail.condition_new': 'New',
    'detail.condition_used': 'Pre-owned',
    'detail.recommended': 'Recommended for you',
    'detail.no_related': 'No similar vehicles found at this time.',
    'detail.benefits_title': 'Included Benefits',
    'detail.benefit_ipva': 'Registration & taxes fully paid',
    'detail.benefit_maintenance': 'Preventive maintenance included',
    'detail.benefit_protection': 'Collision & third-party protection',
    'detail.benefit_assistance': '24-hour roadside assistance',

    // ── Spec Labels (detail page) ──
    'spec_label.engine': 'Engine',
    'spec_label.transmission': 'Transmission',
    'spec_label.capacity': 'Capacity',
    'spec_label.occupants': 'occupants',
    'spec_label.doors': 'Doors',
    'spec_label.brand': 'Make',
    'spec_label.model': 'Model',
    'spec_label.year': 'Year',
    'spec_label.category': 'Category',
    'spec_label.color': 'Color',
    'spec_label.fuel': 'Fuel',
    'spec_label.gearbox': 'Gearbox',
    'spec_label.seats': 'Seats',
    'spec_label.mileage': 'Mileage',
    'spec_label.air_conditioning': 'Air Conditioning',
    'spec_label.test_drive': 'Free Test Drive',
    'spec_label.condition': 'Condition',
    'spec_label.status': 'Status',
    'spec_label.available': 'Available',
    'spec_label.unavailable': 'Unavailable',
    'spec_label.yes': 'Yes',
    'spec_label.no': 'No',

    // ── Colors ──
    'color.White': 'White',
    'color.Black': 'Black',
    'color.Silver': 'Silver',
    'color.Red': 'Red',
    'color.Blue': 'Blue',
    'color.Gray': 'Gray',
    'color.Grey': 'Grey',
    'color.Green': 'Green',
    'color.Yellow': 'Yellow',
    'color.Orange': 'Orange',
    'color.Brown': 'Brown',
    'color.Beige': 'Beige',

    // ── Car Card & Detail (shared) ──
    'car.daily_from': 'Daily rate from',
    'car.sale_price': 'Purchase price',
    'car.free_test_drive': 'Free test-drive',
    'car.available_now': 'Available for immediate delivery',
    'car.location': 'Location',
    'car.specifications': 'Technical Specifications',
    'car.description': 'Vehicle Description',
    'car.protection_included': 'Basic protection included',

    // ── Fees & Taxes ──
    'fee.title': 'Fees & Protection Options',
    'fee.protection_basic': 'Basic CDW Protection (Theft/Damage)',
    'fee.protection_super': 'Super Protection Zero Deductible',
    'fee.additional_driver': 'Additional Driver',
    'fee.extra_km': 'Excess Mileage Fee',
    'fee.return_diff_city': 'One-Way Drop-Off Fee',
    'fee.included': 'Included',
    'fee.optional': 'Optional',

    // ── Footer ──
    'footer.tagline': 'Brazil\'s premier vehicle reservation platform. Premium experience on every kilometer.',
    'footer.company': 'Company',
    'footer.about': 'About Us',
    'footer.sell': 'List Vehicle',
    'footer.blog': 'Blog',
    'footer.partners': 'Partners',
    'footer.support': 'Support',
    'footer.help': 'Help Center',
    'footer.contact': 'Contact Us',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.newsletter': 'Newsletter',
    'footer.newsletter_desc': 'Get exclusive offers and news.',
    'footer.email_placeholder': 'Your best email',
    'footer.rights': 'All rights reserved.',
    'footer.secure_conn': 'SSL 256-bit Secure Connection',

    // ── Filters ──
    'filter.title': 'Filters',
    'filter.vehicle_type': 'Vehicle Type',
    'filter.all': 'All',
    'filter.new': 'New',
    'filter.used': 'Pre-owned',
    'filter.brands': 'Makes',
    'filter.daily_price': 'Daily Price',
    'filter.up_to': 'Up to',
    'filter.category': 'Category',
    'filter.transmission': 'Transmission',
    'filter.fuel': 'Fuel Type',
    'filter.extras': 'Extras',
    'filter.free_test_drive': 'Free Test Drive',
    'filter.max_price': 'Max daily price',
    'filter.sort_by': 'Sort by',
    'filter.sort_lowest': 'Lowest price',
    'filter.sort_highest': 'Highest price',
    'filter.sort_newest': 'Newest additions',

    // ── Toast Messages ──
    'toast.login_to_favorite': 'Sign in to add favorites',
    'toast.wishlist_updated': 'Wishlist updated',
    'toast.login_to_buy': 'Sign in to purchase',
    'toast.interest_registered': 'Interest registered! We\'ll contact you about the',
    'toast.login_to_favorite_vehicles': 'Sign in to favorite vehicles'
  }
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'nexdrive_lang';
  
  readonly currentLang = signal<Language>(this.getInitialLang());

  private getInitialLang(): Language {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Language;
    if (saved === 'pt' || saved === 'en') return saved;
    return 'pt';
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  toggleLanguage() {
    this.setLanguage(this.currentLang() === 'pt' ? 'en' : 'pt');
  }

  t(key: string): string {
    const lang = this.currentLang();
    return TRANSLATIONS[lang][key] || TRANSLATIONS['pt'][key] || key;
  }

  // Helper computed map for template translations
  readonly labels = computed(() => TRANSLATIONS[this.currentLang()]);
}
