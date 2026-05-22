# 🏗️ Provider Dashboard - System Architecture

## 📊 Complete System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER / CLIENT SIDE                         │
│                   (Blade Templates + Tailwind CSS)               │
│                                                                   │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────┐  ┌───────────┐│
│  │  Dashboard  │  │ Services │  │ Reservations │  │  Photos   ││
│  │   Overview  │  │  (CRUD)  │  │ (Management) │  │ (Gallery) ││
│  └─────────────┘  └──────────┘  └──────────────┘  └───────────┘│
└───────────────────────────────────────────────────────────────────┘
                              ↓
                    FORM SUBMISSIONS
                         (POST/PUT)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTING LAYER                               │
│                      (Laravel Routes)                            │
│                                                                   │
│  /provider-dashboard                                             │
│  /provider-dashboard/services                                    │
│  /provider-dashboard/reservations                                │
│  /provider-dashboard/photos                                      │
│  /provider-dashboard/profile                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                              │
│                  (HTTP Request Handling)                          │
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ProviderDashboard     │  │ Service          │  │ Reservation││
│  │Controller            │  │ Controller       │  │ Controller ││
│  ├──────────────────────┤  ├──────────────────┤  ├────────────┤│
│  │• index()             │  │• index()         │  │• index()   ││
│  │• profile()           │  │• create()        │  │• show()    ││
│  │• updateProfile()     │  │• store()         │  │• accept()  ││
│  │                      │  │• edit()          │  │• reject()  ││
│  │                      │  │• update()        │  │• complete()││
│  │                      │  │• destroy()       │  │• cancel()  ││
│  └──────────────────────┘  └──────────────────┘  └────────────┘│
│                                                                   │
│  ┌──────────────────────────────┐                                │
│  │ PhotoController              │                                │
│  ├──────────────────────────────┤                                │
│  │• index()                     │                                │
│  │• create()                    │                                │
│  │• store()                     │                                │
│  │• destroy()                   │                                │
│  │• setAsProfile()              │                                │
│  └──────────────────────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MODEL LAYER                                 │
│                  (Eloquent ORM / Database)                       │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  User    │  │Prestataire│ │  Service   │  │Reservation│  │
│  ├──────────┤  ├──────────┤  ├──────────────┤  ├────────────┤  │
│  │id        │  │user_id   │  │id           │  │id         │  │
│  │name      │  │nomEntreprise│ │prestataire_id│ │client_id   │  │
│  │email     │  │description│  │name         │  │service_id  │  │
│  │role      │  │adresse   │  │description  │  │date        │  │
│  │          │  │photo     │  │price        │  │start_time  │  │
│  │hasOne()  │  │ville     │  │duration     │  │end_time    │  │
│  │Prestataire│ │is_validated │category       │  │status      │  │
│  │hasOne()  │  │          │  │image        │  │            │  │
│  │Client    │  │          │  │             │  │belongsTo() │  │
│  │          │  │belongsTo()│ │belongsTo()  │  │Client      │  │
│  │          │  │User      │  │Prestataire  │  │belongsTo() │  │
│  │          │  │hasMany() │  │hasMany()    │  │Service     │  │
│  │          │  │Services  │  │Reservations │  │            │  │
│  │          │  │hasMany() │  │hasMany()    │  │            │  │
│  │          │  │Photos    │  │Avis         │  │            │  │
│  └──────────┘  └──────────┘  └──────────────┘  └────────────┘  │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐                   │
│  │  Photo   │  │  Client  │  │   Avis       │                   │
│  ├──────────┤  ├──────────┤  ├──────────────┤                   │
│  │id        │  │user_id   │  │id           │                   │
│  │prestataire_id│address  │  │client_id     │                   │
│  │path      │  │          │  │service_id    │                   │
│  │          │  │belongsTo()│ │rating        │                   │
│  │          │  │User      │  │comment       │                   │
│  │belongsTo()│ │hasMany() │  │              │                   │
│  │Prestataire│ │Reservations│ │belongsTo() │                   │
│  │getUrl()  │  │hasMany() │  │Client       │                   │
│  │accessor  │  │Avis      │  │belongsTo() │                   │
│  └──────────┘  └──────────┘  │Service      │                   │
│                                │             │                   │
│                                └──────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                                  │
│                    (MySQL/MariaDB)                               │
│                                                                   │
│  ┌─────────┐  ┌───────────┐  ┌──────────────┐  ┌───────────┐   │
│  │ users   │  │prestataires│  │  services   │  │reservation│   │
│  ├─────────┤  ├───────────┤  ├──────────────┤  ├───────────┤   │
│  │ id (PK) │  │ user_id(PK)│  │ id (PK)    │  │ id (PK)  │   │
│  │ name    │  │ nomEntreprise│ │ prestataire_id│ │ client_id  │   │
│  │ email   │  │ description│  │ name        │  │ service_id │   │
│  │ role    │  │ adresse   │  │ description │  │ date       │   │
│  │ phone   │  │ photo     │  │ price       │  │ start_time │   │
│  │ city    │  │ ville     │  │ duration    │  │ end_time   │   │
│  │ password│  │ is_validated │ category       │  │ status     │   │
│  └─────────┘  └───────────┘  │ image       │  └───────────┘   │
│                                │ created_at  │                   │
│  ┌─────────┐  ┌───────────┐  │ updated_at  │  ┌───────────┐   │
│  │ clients │  │  photos   │  └──────────────┘  │   avis    │   │
│  ├─────────┤  ├───────────┤                    ├───────────┤   │
│  │ user_id │  │ id (PK) │                     │ id (PK)  │   │
│  │ address │  │ prestataire_id│              │ client_id  │   │
│  │         │  │ path    │                     │ service_id │   │
│  └─────────┘  └───────────┘                    │ rating     │   │
│                                                │ comment    │   │
│                                                └───────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     FILE STORAGE                                 │
│                  (Local Filesystem)                              │
│                                                                   │
│  storage/app/public/                                             │
│  ├── services/           (Service images)                        │
│  ├── prestataire-photos/ (Profile photos)                        │
│  └── photos/             (Gallery photos)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Examples

### Example 1: Create Service
```
1. User fills form in /services/create view
2. Clicks "Créer le service" button
3. Browser sends POST /provider-dashboard/services
   - Form data: name, description, price, duration, category, image
   - CSRF token included
   
4. ServiceController::store() receives request
   - Validates input
   - Uploads image to storage/app/public/services/
   - Creates Service record in database
   
5. Service record saved to database with:
   - prestataire_id (auth user id)
   - All form fields
   - Image path
   
6. Redirect to services list with success message
7. Browser shows new service in card layout
```

### Example 2: Accept Reservation
```
1. User clicks "Accepter" button on reservation
2. Browser sends POST /provider-dashboard/reservations/{id}/accept
   - CSRF token included
   
3. ReservationController::accept() receives request
   - Verifies user owns service
   - Updates reservation status to 'accepted'
   
4. Database updates Reservation record:
   - status = 'accepted'
   - updated_at = now
   
5. Redirect back with success message
6. Browser shows status changed to green badge
```

### Example 3: Upload Photo
```
1. User clicks upload area or drags photos
2. Browser sends POST /provider-dashboard/photos
   - File: multipart/form-data
   - Multiple files support
   
3. PhotoController::store() receives request
   - Validates each file
   - Each file uploaded to storage/app/public/photos/
   - Creates Photo record for each file
   
4. Photos saved to database with:
   - prestataire_id
   - path to storage
   - created_at timestamp
   
5. Redirect to gallery with success message
6. Browser shows new photos in grid
```

---

## 🔐 Security Flow

```
User Request
    ↓
Middleware: Auth Check
    ↓ (Must be logged in)
Route Match
    ↓
Controller Action
    ↓
Authorization Check (user owns resource)
    ↓ (Failed: 403 abort)
Business Logic
    ↓
Validation
    ↓ (Failed: return with errors)
Database Operation (if needed)
    ↓
File Operation (if needed)
    ↓
Response (View or Redirect)
    ↓
Browser
```

---

## 🎯 Data Relationships

### User → Prestataire (1:1)
```
User has One Prestataire
Prestataire belongs To User

When user logs in:
  → Check if Prestataire exists
  → If not, event listener creates it
  → Dashboard shows prestataire data
```

### Prestataire → Services (1:Many)
```
Prestataire has Many Services
Service belongs To Prestataire

Provider can have multiple services
Each service linked to prestataire via prestataire_id
Dashboard shows total count
Services list shows only this provider's services
```

### Service → Reservations (1:Many)
```
Service has Many Reservations
Reservation belongs To Service

Service can have multiple reservations
Each reservation linked to service via service_id
When deleting service, all reservations cascade delete
```

### Prestataire → Photos (1:Many)
```
Prestataire has Many Photos
Photo belongs To Prestataire

Provider can upload multiple photos
Each photo linked to prestataire via prestataire_id
Photos used for gallery and profile picture
```

### Reservation → Client (Many:1)
```
Client has Many Reservations
Reservation belongs To Client

Multiple reservations can be from same client
Used to show client info on reservation details
```

---

## 📁 File Structure Tree

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── ProviderDashboardController.php    ← NEW
│   │   │   ├── ServiceController.php              ← NEW
│   │   │   ├── ReservationController.php          ← NEW
│   │   │   ├── PhotoController.php                ← NEW
│   │   │   ├── Api/
│   │   │   └── Controller.php
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   └── Kernel.php
│   ├── Listeners/
│   │   └── CreatePrestastaireOnLogin.php          ← NEW
│   ├── Models/
│   │   ├── User.php                              ← UPDATED
│   │   ├── Prestataire.php                       ← UPDATED
│   │   ├── Service.php                           ← UPDATED
│   │   ├── Reservation.php
│   │   ├── Photo.php
│   │   ├── Client.php
│   │   ├── Avis.php
│   │   └── Calendrier.php
│   ├── Providers/
│   │   ├── EventServiceProvider.php              ← UPDATED
│   │   ├── AppServiceProvider.php
│   │   └── ...
│   └── ...
├── database/
│   ├── migrations/
│   │   ├── 2014_10_12_000000_create_users_table.php
│   │   ├── 2026_04_11_000002_create_prestataires_table.php
│   │   ├── 2026_04_11_000003_create_services_table.php
│   │   ├── 2026_04_11_000004_create_reservations_table.php
│   │   ├── 2026_05_05_000001_add_photo_and_ville...php  ← NEW
│   │   ├── 2026_05_05_000002_add_image_to_services...php ← NEW
│   │   └── ...
│   ├── seeders/
│   └── factories/
├── resources/
│   └── views/
│       ├── layouts/
│       │   └── provider.blade.php                 ← NEW
│       ├── provider/
│       │   ├── dashboard/
│       │   │   ├── index.blade.php               ← NEW
│       │   │   └── profile.blade.php             ← NEW
│       │   ├── services/
│       │   │   ├── index.blade.php               ← NEW
│       │   │   ├── create.blade.php              ← NEW
│       │   │   └── edit.blade.php                ← NEW
│       │   ├── reservations/
│       │   │   ├── index.blade.php               ← NEW
│       │   │   └── show.blade.php                ← NEW
│       │   └── photos/
│       │       ├── index.blade.php               ← NEW
│       │       └── create.blade.php              ← NEW
│       └── welcome.blade.php
├── routes/
│   ├── web.php                                   ← UPDATED
│   └── api.php
├── storage/
│   ├── app/
│   │   └── public/
│   │       ├── services/                         ← NEW (on upload)
│   │       ├── prestataire-photos/               ← NEW (on upload)
│   │       └── photos/                           ← NEW (on upload)
│   ├── framework/
│   └── logs/
├── IMPLEMENTATION_COMPLETE.md                    ← NEW
├── PROVIDER_DASHBOARD_SETUP.md                   ← NEW
├── PROVIDER_DASHBOARD_QUICKSTART.md              ← NEW
├── FILE_INVENTORY.md                             ← NEW
└── URL_FEATURE_MAP.md                            ← NEW
```

---

## 🔄 Event Flow

### On User Login
```
User submits login form
    ↓
AuthController authenticates user
    ↓
Illuminate\Auth\Events\Login event fired
    ↓
CreatePrestastaireOnLogin listener triggered
    ↓
Check: user.role === 'prestataire'?
    ↓ YES
Check: Prestataire record exists?
    ↓ NO
Create new Prestataire record:
  - user_id = logged in user id
  - nomEntreprise = user.name
  - description = ''
  - adresse = user.city ?? ''
    ↓
User logged in successfully
User can access /provider-dashboard
```

---

## 💾 Database Transactions

### Create Service
```sql
BEGIN TRANSACTION
  INSERT INTO services (prestataire_id, name, description, price, duration, category, image, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
COMMIT
```

### Update Reservation Status
```sql
BEGIN TRANSACTION
  UPDATE reservations
  SET status = ?, updated_at = NOW()
  WHERE id = ? AND service_id IN (
    SELECT id FROM services WHERE prestataire_id = ?
  );
COMMIT
```

### Delete Photo
```sql
BEGIN TRANSACTION
  DELETE FROM photos
  WHERE id = ? AND prestataire_id = ?;
  -- File deleted from storage in controller
COMMIT
```

---

## 🎯 Performance Considerations

### Database Queries Optimized
- [x] Relationships eager loaded with `with()`
- [x] Pagination limits queries (10, 12, or 15 per page)
- [x] Indexed queries on foreign keys
- [x] Avoid N+1 queries with proper relationships

### File Storage Optimized
- [x] Files stored in `storage/app/public`
- [x] Accessible via `/storage/` route
- [x] File validation before upload
- [x] Size limits enforced (2MB services, 5MB photos)

### Frontend Optimized
- [x] Tailwind CSS utilities (no extra CSS)
- [x] Font Awesome CDN (lightweight icons)
- [x] No heavy JavaScript libraries
- [x] Native HTML form submissions

---

## 🔐 Authorization Matrix

```
                 Own Service | Own Reservation | Own Photo
User Action      YES | NO    | YES | NO        | YES | NO
─────────────────────────────────────────────────────────
Create Service    ✅  | ❌    | N/A              | N/A
Read Service      ✅  | ❌    | ✅  | ❌        | N/A
Update Service    ✅  | ❌    | N/A              | N/A
Delete Service    ✅  | ❌    | N/A              | N/A
─────────────────────────────────────────────────────────
Accept Reserv.    N/A        | ✅  | ❌        | N/A
Reject Reserv.    N/A        | ✅  | ❌        | N/A
Complete Reserv.  N/A        | ✅  | ❌        | N/A
Cancel Reserv.    N/A        | ✅  | ❌        | N/A
─────────────────────────────────────────────────────────
Delete Photo       N/A        | N/A              | ✅  | ❌
Set Profile Photo  N/A        | N/A              | ✅  | ❌
```

---

## 📊 System Capacity

| Component | Capacity | Notes |
|-----------|----------|-------|
| Services per provider | Unlimited | Paginated 10/page |
| Reservations per service | Unlimited | Paginated 15/page |
| Photos per provider | Unlimited | Paginated 12/page |
| Max file size (service) | 2MB | Enforced in validation |
| Max file size (photo) | 5MB | Enforced in validation |
| Concurrent users | Unlimited | Depends on server |
| Database records | Unlimited | Depends on storage |

---

**This architecture scales from 1 provider to 1,000+ providers efficiently!**

Last Updated: May 5, 2026
