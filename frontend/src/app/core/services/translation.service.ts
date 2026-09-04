import { Injectable, signal, computed } from '@angular/core';

export type Language = 'fr' | 'en';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.menu': 'La Carte & Produits',
    'nav.reservations': 'Réservations',
    'nav.birthday': 'Anniversaires',
    'nav.events': 'Événements',
    'nav.reviews': 'Avis Clients',
    'nav.contact': 'Contact',
    'nav.loyalty': 'Fidélité',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',
    'nav.logout': 'Déconnexion',
    'nav.admin': 'Administration',
    'nav.cart': 'Panier',

    // Hero
    'hero.badge': 'L\'art du café & de la détente',
    'hero.title': 'L\'Expérience Rare de',
    'hero.subtitle': 'Plongez dans l\'atmosphère chaleureuse et raffinée de notre lounge. Cafés grands crus torréfiés sur mesure, douceurs artisanales et moments inoubliables.',
    'hero.btn_order': 'Commander en Ligne',
    'hero.btn_reserve': 'Réserver une Table',

    // Loyalty Banner
    'loyalty.title': 'Programme Fidélité Le Bayou',
    'loyalty.badge': 'Offre Spéciale',
    'loyalty.target_desc': 'Cumulez 10 points à chaque commande. Atteignez l\'objectif et dégustez votre café offert !',
    'loyalty.current': 'Vos points actuels :',
    'loyalty.celebration_title': 'FÉLICITATIONS ! 🎉',
    'loyalty.celebration_desc': 'Vous avez atteint votre palier de fidélité ! Votre prochain café Signature vous est offert en caisse ou à la livraison.',

    // Catalog
    'catalog.title': 'Notre Carte & Boutique',
    'catalog.subtitle': 'Chaque création est préparée avec passion et des ingrédients de première qualité.',
    'catalog.all': 'Toutes les catégories',
    'catalog.add_to_cart': 'Ajouter au panier',
    'catalog.details': 'Détails',
    'catalog.delivery_note': 'Paiement à la livraison / sur place',

    // Cart
    'cart.title': 'Votre Panier',
    'cart.empty': 'Votre panier est vide pour le moment.',
    'cart.total': 'Total à régler :',
    'cart.checkout': 'Valider ma commande',
    'cart.delivery_address': 'Adresse de livraison & Position GPS',
    'cart.get_gps': 'Utiliser ma position GPS actuelle',
    'cart.notes': 'Instructions spéciales / Digicode / Étage',

    // Reservations
    'res.title': 'Réservations & Événements Privés',
    'res.table_title': 'Réserver une Table',
    'res.birthday_title': 'Célébrer un Anniversaire au Lounge',
    'res.date': 'Date',
    'res.time': 'Heure',
    'res.guests': 'Nombre d\'invités',
    'res.notes': 'Demandes particulières',
    'res.submit': 'Confirmer la réservation',

    // Birthday
    'bday.slots_title': 'Créneaux Disponibles pour Anniversaire',
    'bday.menus_title': 'Nos Formules Anniversaires Gourmandes',
    'bday.person_name': 'Nom de la personne fêtée',
    'bday.book_now': 'Réserver ce créneau',

    // Reviews
    'reviews.title': 'Ce que nos clients disent',
    'reviews.add': 'Laisser un avis',
    'reviews.rating': 'Votre note',
    'reviews.comment': 'Votre commentaire',

    // Common
    'common.free_coffee': 'Café Offert',
    'common.currency': 'DT',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.menu': 'Menu & Shop',
    'nav.reservations': 'Reservations',
    'nav.birthday': 'Birthdays',
    'nav.events': 'Events',
    'nav.reviews': 'Reviews',
    'nav.contact': 'Contact',
    'nav.loyalty': 'Loyalty',
    'nav.login': 'Sign In',
    'nav.register': 'Sign Up',
    'nav.logout': 'Sign Out',
    'nav.admin': 'Admin Panel',
    'nav.cart': 'Cart',

    // Hero
    'hero.badge': 'Artisan Coffee & Lounge Experience',
    'hero.title': 'The Rare Experience of',
    'hero.subtitle': 'Immerse yourself in our warm, refined lounge atmosphere. Single-origin specialty coffees, hand-crafted pastries, and memorable moments.',
    'hero.btn_order': 'Order Online',
    'hero.btn_reserve': 'Book a Table',

    // Loyalty Banner
    'loyalty.title': 'Le Bayou Loyalty Program',
    'loyalty.badge': 'Special Reward',
    'loyalty.target_desc': 'Earn 10 points with every order. Hit the goal and unlock your complimentary specialty coffee!',
    'loyalty.current': 'Your current points:',
    'loyalty.celebration_title': 'CONGRATULATIONS! 🎉',
    'loyalty.celebration_desc': 'You reached your loyalty milestone! Your next Signature Coffee is completely free on delivery or in person.',

    // Catalog
    'catalog.title': 'Our Menu & Store',
    'catalog.subtitle': 'Each cup and pastry is prepared with passion and top-tier ingredients.',
    'catalog.all': 'All categories',
    'catalog.add_to_cart': 'Add to cart',
    'catalog.details': 'Details',
    'catalog.delivery_note': 'Pay on delivery / in person',

    // Cart
    'cart.title': 'Your Cart',
    'cart.empty': 'Your cart is currently empty.',
    'cart.total': 'Total to pay:',
    'cart.checkout': 'Place Order',
    'cart.delivery_address': 'Delivery Address & GPS Location',
    'cart.get_gps': 'Pin My Current GPS Location',
    'cart.notes': 'Special instructions / Building code / Floor',

    // Reservations
    'res.title': 'Reservations & Private Events',
    'res.table_title': 'Book a Table',
    'res.birthday_title': 'Celebrate a Birthday at the Lounge',
    'res.date': 'Date',
    'res.time': 'Time',
    'res.guests': 'Number of guests',
    'res.notes': 'Special requests',
    'res.submit': 'Confirm Reservation',

    // Birthday
    'bday.slots_title': 'Available Birthday Slots',
    'bday.menus_title': 'Our Gourmet Birthday Packages',
    'bday.person_name': 'Birthday VIP name',
    'bday.book_now': 'Book this slot',

    // Reviews
    'reviews.title': 'What Our Guests Say',
    'reviews.add': 'Write a Review',
    'reviews.rating': 'Your Rating',
    'reviews.comment': 'Your Review',

    // Common
    'common.free_coffee': 'Free Coffee',
    'common.currency': 'DT',
  }
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<Language>('fr');

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem('bayou_lang', lang);
  }

  toggleLanguage() {
    const next = this.currentLang() === 'fr' ? 'en' : 'fr';
    this.setLanguage(next);
  }

  translate(key: string): string {
    const lang = this.currentLang();
    return TRANSLATIONS[lang][key] || key;
  }

  getField(item: any, fieldBase: string): string {
    if (!item) return '';
    const lang = this.currentLang();
    const fieldName = `${fieldBase}_${lang}`;
    return item[fieldName] || item[`${fieldBase}_fr`] || item[`${fieldBase}_en`] || '';
  }

  constructor() {
    const saved = localStorage.getItem('bayou_lang') as Language;
    if (saved === 'fr' || saved === 'en') {
      this.currentLang.set(saved);
    }
  }
}
