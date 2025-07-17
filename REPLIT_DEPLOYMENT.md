
# 🚀 CV Optimizer Pro - Deployment na Replit

## 📋 Instrukcje wdrożenia

### 1. Przygotowanie środowiska

1. **Skopiuj wszystkie pliki** do swojego Replit workspace
2. **Ustaw zmienne środowiskowe** w Replit Secrets:
   - `OPENROUTER_API_KEY` - klucz API OpenRouter
   - `STRIPE_SECRET_KEY` - klucz tajny Stripe
   - `VITE_STRIPE_PUBLIC_KEY` - klucz publiczny Stripe

### 2. Konfiguracja bazy danych

Aplikacja automatycznie używa SQLite jako domyślnej bazy danych.
Dla produkcji można skonfigurować PostgreSQL przez zmienną `DATABASE_URL`.

### 3. Uruchomienie aplikacji

```bash
python app.py
```

Aplikacja uruchomi się na porcie 5000 i będzie dostępna pod adresem Replit.

### 4. Konto deweloperskie

Automatycznie tworzone konto z pełnym dostępem:
- **Username:** `developer`
- **Password:** `DevAdmin2024!`
- **Email:** `dev@cvoptimizer.pro`

### 5. Funkcje aplikacji

**Darmowe (z watermarkiem):**
- Podgląd analizy CV

**Płatne (9.99 PLN):**
- Optymalizacja CV
- Sprawdzenie ATS
- Korekta gramatyczna

**Premium (29.99 PLN/miesiąc):**
- Wszystkie funkcje AI
- Dashboard Premium
- Generowanie CV przez AI
- Analiza rekruterska

### 6. Deployment na Replit

1. **Fork** projekt na Replit
2. **Ustaw Secrets** (zmienne środowiskowe)
3. **Kliknij Run** - aplikacja uruchomi się automatycznie
4. **Użyj URL** podany przez Replit do dostępu

### 7. Bezpieczeństwo

- ✅ Zabezpieczenia sesji
- ✅ Walidacja danych wejściowych
- ✅ Ochrona przed atakami
- ✅ Bezpieczne przechowywanie haseł
- ✅ Integracja z Stripe

### 8. Monitorowanie

Aplikacja automatycznie loguje:
- Błędy systemu
- Aktywność użytkowników
- Płatności
- Dostęp do API

## 🎯 Gotowa do produkcji!

Aplikacja jest w pełni przygotowana do wdrożenia na Replit z wszystkimi funkcjami:
- System płatności Stripe
- AI analizy CV
- Dashboard użytkownika
- Bezpieczeństwo
- Monitoring
