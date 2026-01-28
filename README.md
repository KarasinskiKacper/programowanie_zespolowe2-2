Programowanie Zespołowe 2 - Aplikacja aukcji online "Largo"

## Opis projektu
Aplikacja "Largo" umożliwia użytkownikom dodawanie przedmiotów do licytacji i brania udziału w licytacjach.

## Wymagania
- Python 3.12
- MySQL 8.0
- Node v20.12.2
- npm 10.8.0

## Instalacja
Przed instalacją należy utworzyć w `frontend/` i `backend/` pliki `.env` według szablonów.
```bash
git clone https://github.com/KarasinskiKacper/programowanie_zespolowe2-2.git
cd programowanie_zespolowe2-2
pip install -r requirements.txt

cd frontend
npm i
```

## Uruchomienie aplikacji
Przed pierwszym uruchomieniem należy skonfigurować bazę MySQL używając `Database/aukcje.sql`.<br>
Po przygotowaniu bazy danych aplikacje uruchamia się w następujący sposób:
```bash
cd backend
python3 main.py

cd ../frontend
npm run dev
```

## Struktura projektu
```
programowanie_zespolowe2-2/
├── backend/
│   ├── main.py
│   ├── .env
│   ├── Database/
│   └── docs/
├── frontend/
│   ├── package.json
│   ├── src/
│   └── docs/
|
├── requirements.txt
└── README.md
```
## Działanie Aplikacji
Użytkownik rozpoczyna od utworzenia konta i zalogowania się, aby uzyskać dostęp do aplikacji. Użytkownik ma możliwość zmiany hasła w panelu użytkownika. 
Użytkownik na głównej stronie widzi przedmioty wystawione na licytację ze zdjęciem produktu, ceną, statusem aukcji i nazwą. Po kliknięciu na aukcję pojawiają się szczegółowe informację na jej temat i możliwość wzięcia udziału w licytacji poprzez przebicie aktualnej ceny. Użytkownik otrzymuje powiadomienie o przebiciu aukcji w której bierze udział. Użytkownik może stworzyć aukcję podając nazwę aukcji, cenę początkową, daty rozpoczęcia i zakończenia aukcji, zdjęcia produktu, opis i kategorie. 
Użytkownik ma możliwość podglądu listy aukcji, które sam stworzył, w których bierze udział i zarchiwizowanych w których wygrał.
Użytkownik ma możliwość wyszukiwania aukcji po nazwę i filtrowania po kategorii.

## Autorzy
Aplikacja została stworzona przez:
* Karasiński Kacper
* Dyczek Paweł
* Całus Mikołaj
* Herzyk Paweł
* Lipiński Dawid