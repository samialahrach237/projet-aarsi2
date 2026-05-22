# Provider Dashboard Setup - AARSSI

## Overview

This is a complete **Provider (Prestataire) Dashboard** for the AARSSI service marketplace platform. It provides a professional, modern interface for service providers to manage their business.

---

## ✅ What Has Been Created

### 1. **Database Migrations**
- ✅ `2026_05_05_000001_add_photo_and_ville_to_prestataires_table.php` - Adds photo and ville columns
- ✅ `2026_05_05_000002_add_image_to_services_table.php` - Adds image column to services

### 2. **Models** (Updated with relationships)
- ✅ `User` - hasOne Prestataire, hasOne Client
- ✅ `Prestataire` - belongsTo User, hasMany Services, hasMany Photos, hasMany Calendrier
- ✅ `Service` - belongsTo Prestataire, hasMany Reservations, hasMany Avis
- ✅ `Reservation` - belongsTo Client, belongsTo Service
- ✅ `Photo` - belongsTo Prestataire, with URL accessor for storage
- ✅ `Client` - belongsTo User, hasMany Reservations, hasMany Avis
- ✅ `Avis` - belongsTo Client, belongsTo Service
- ✅ `Calendrier` - belongsTo Prestataire

### 3. **Controllers**
- ✅ `ProviderDashboardController` - Dashboard overview & profile management
- ✅ `ServiceController` - CRUD operations for services
- ✅ `ReservationController` - Manage reservations with accept/reject/complete actions
- ✅ `PhotoController` - Photo gallery with upload/delete and profile photo features

### 4. **Event Listeners**
- ✅ `CreatePrestastaireOnLogin` - Auto-creates prestataire record on first login if user role is 'prestataire'
- ✅ Registered in `EventServiceProvider`

### 5. **Routes** (in `routes/web.php`)
All routes are protected with `auth` middleware and prefixed with `/provider-dashboard`

```php
/provider-dashboard                                    # Dashboard overview
/provider-dashboard/profile                            # View & edit profile
/provider-dashboard/services                          # List services
/provider-dashboard/services/create                   # Create service
/provider-dashboard/services/{id}/edit                # Edit service
/provider-dashboard/services/{id}                     # Delete service
/provider-dashboard/reservations                      # List reservations
/provider-dashboard/reservations/{id}                 # View reservation details
/provider-dashboard/reservations/{id}/accept          # Accept reservation
/provider-dashboard/reservations/{id}/reject          # Reject reservation
/provider-dashboard/reservations/{id}/complete        # Mark as completed
/provider-dashboard/reservations/{id}/cancel          # Cancel reservation
/provider-dashboard/photos                            # Photo gallery
/provider-dashboard/photos/create                     # Upload photos
/provider-dashboard/photos/{id}                       # Delete photo
/provider-dashboard/photos/{id}/set-profile           # Set as profile photo
```

### 6. **Blade Views** (Tailwind CSS + Bootstrap Icons)
- ✅ `layouts/provider.blade.php` - Main layout with sidebar navigation
- ✅ `provider/dashboard/index.blade.php` - Dashboard overview with stats
- ✅ `provider/dashboard/profile.blade.php` - Profile edit form
- ✅ `provider/services/index.blade.php` - Services list (card layout)
- ✅ `provider/services/create.blade.php` - Create service form
- ✅ `provider/services/edit.blade.php` - Edit service form
- ✅ `provider/reservations/index.blade.php` - Reservations table view
- ✅ `provider/reservations/show.blade.php` - Reservation details
- ✅ `provider/photos/index.blade.php` - Photo gallery grid
- ✅ `provider/photos/create.blade.php` - Upload photos (with drag-drop)

---

## 🚀 Setup Instructions

### Step 1: Run Migrations
```bash
cd backend
php artisan migrate
```

### Step 2: Create Storage Link
```bash
php artisan storage:link
```

### Step 3: Configure File Upload (optional)
Edit `config/filesystems.php` if needed. Default uses `storage/app/public`.

### Step 4: Access the Dashboard
- Log in as a user with `role = 'prestataire'`
- You will be automatically redirected or can go to: `http://localhost/provider-dashboard`
- A prestataire profile will be auto-created on first login

---

## 📋 Features

### Dashboard Overview
- **Profile Card** - Shows prestataire info with profile photo
- **Statistics Cards** - Total services, reservations, pending requests, photos count
- **Latest Reservations** - Shows 5 recent reservations with quick actions

### Services Management
- **List Services** - View all services in card layout with price and duration
- **Create Service** - Add new service with title, description, price, duration, category, and image
- **Edit Service** - Modify existing services
- **Delete Service** - Remove services with confirmation

### Reservations Management
- **List Reservations** - View all reservations for provider's services
- **View Details** - See full reservation details with client info
- **Accept/Reject** - Manage pending reservations
- **Mark Completed** - When service is done
- **Cancel** - Cancel accepted reservations

### Photo Gallery
- **Upload Photos** - Single or multiple photo upload with drag-drop
- **Gallery View** - Grid layout with hover effects
- **Set Profile Photo** - Set any photo as provider profile picture
- **Delete Photos** - Remove photos from gallery

### Profile Management
- **Edit Information** - Update business name, description, address, city
- **Profile Photo** - Upload and manage profile picture

---

## 🎨 UI/UX Design

### Modern Dashboard Features
- **Sidebar Navigation** - Easy access to all sections
- **Blue Gradient Theme** - Professional color scheme
- **Card-based Layout** - Clean, organized information presentation
- **Responsive Design** - Works on mobile, tablet, desktop
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome Icons** - 600+ icons for visual appeal
- **Status Badges** - Color-coded reservation statuses (Pending, Accepted, Rejected, Completed)
- **Hover Effects** - Interactive elements for better UX
- **Flash Messages** - Success/error notifications

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── ProviderDashboardController.php
│   │       ├── ServiceController.php
│   │       ├── ReservationController.php
│   │       └── PhotoController.php
│   ├── Listeners/
│   │   └── CreatePrestastaireOnLogin.php
│   └── Models/
│       ├── User.php (updated)
│       ├── Prestataire.php (updated)
│       ├── Service.php (updated)
│       └── ...
├── database/
│   └── migrations/
│       ├── 2026_05_05_000001_add_photo_and_ville_to_prestataires_table.php
│       └── 2026_05_05_000002_add_image_to_services_table.php
├── resources/
│   └── views/
│       ├── layouts/
│       │   └── provider.blade.php
│       └── provider/
│           ├── dashboard/
│           │   ├── index.blade.php
│           │   └── profile.blade.php
│           ├── services/
│           │   ├── index.blade.php
│           │   ├── create.blade.php
│           │   └── edit.blade.php
│           ├── reservations/
│           │   ├── index.blade.php
│           │   └── show.blade.php
│           └── photos/
│               ├── index.blade.php
│               └── create.blade.php
└── routes/
    └── web.php (updated with dashboard routes)
```

---

## 🔒 Security Features

1. **Authentication** - All routes require `auth` middleware
2. **Authorization** - Controllers verify user owns the resource
3. **CSRF Protection** - All forms have @csrf token
4. **Validation** - Server-side validation on all inputs
5. **Soft Deletes** - Available if needed (can be added to models)

---

## ✨ Key Features Implemented

### Auto-Prestataire Creation
When a user with `role = 'prestataire'` logs in for the first time:
- Automatically creates a `Prestataire` record
- Sets business name to user's name
- Prevents "Prestataire not found" errors

### Image Uploads
- Services and photos stored in `storage/app/public`
- Automatic URL generation via model accessor
- Support for JPEG, PNG, GIF formats
- Max file size: 2MB for services, 5MB for photos

### Responsive Tables
- Automatically stack on mobile devices
- Hover effects on desktop
- Action buttons organized efficiently

### Status Management
- **Pending** - Yellow badge
- **Accepted** - Green badge
- **Rejected** - Red badge
- **Completed** - Blue badge
- **Cancelled** - Gray badge

---

## 🎯 Usage Examples

### Create a Service
1. Click "Services" in sidebar
2. Click "Ajouter un service" button
3. Fill in service details
4. Upload service image
5. Click "Créer le service"

### Manage Reservations
1. Click "Réservations" in sidebar
2. View all reservations in table
3. Click "Voir" to see details
4. Accept or Reject pending reservations
5. Mark as Completed when done

### Upload Photos
1. Click "Photos" in sidebar
2. Click "Ajouter des photos"
3. Drag and drop or click to select multiple photos
4. Click "Télécharger les photos"
5. Hover over photos to set as profile or delete

---

## 🐛 Troubleshooting

### "Prestataire profile not found"
**Solution:** Make sure user has `role = 'prestataire'`. Login again to trigger auto-creation.

### Images not showing
**Solution:** Run `php artisan storage:link` to create the symbolic link.

### File upload fails
**Solution:** Check `storage/app/public` directory permissions. Run `chmod -R 775 storage`.

### Routes not found
**Solution:** Clear route cache with `php artisan route:cache` or `php artisan optimize:clear`.

---

## 📦 Dependencies

- Laravel 10+ (uses standard Laravel features)
- Tailwind CSS (included via CDN in layout)
- Font Awesome Icons (included via CDN)
- PHP 8.1+

No additional packages required! Uses only Laravel built-in features.

---

## 📝 Next Steps (Optional Enhancements)

1. **Add Calendar Integration** - FullCalendar.io for reservation scheduling
2. **Email Notifications** - Notify providers on new reservations
3. **Analytics Dashboard** - Show revenue, customer stats, etc.
4. **Messaging System** - In-app chat with clients
5. **Reviews & Ratings** - Display client reviews
6. **Availability Management** - Set working hours and availability
7. **Invoice Generation** - Create and download invoices
8. **Export Data** - Export reservations and services to CSV/PDF

---

## 📄 License

This provider dashboard is part of the AARSSI service marketplace project.

---

## 👤 Author Notes

All code follows Laravel best practices:
- ✅ Proper model relationships
- ✅ RESTful controller methods
- ✅ Blade template inheritance
- ✅ Consistent naming conventions
- ✅ DRY (Don't Repeat Yourself) principles
- ✅ Security best practices
- ✅ Clean, readable code

---

**Setup Complete! Your Provider Dashboard is Ready to Use! 🎉**
