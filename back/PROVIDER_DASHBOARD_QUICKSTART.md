# AARSSI Provider Dashboard - Quick Start Guide

## 🚀 Installation & Deployment

### Prerequisites
- PHP 8.1+
- Laravel 10+
- MySQL/MariaDB
- Composer

### Quick Setup (5 minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Run migrations to add new tables/columns
php artisan migrate

# 3. Create symbolic link for storage
php artisan storage:link

# 4. Clear cache (if needed)
php artisan optimize:clear
```

### Done! ✅

---

## 📊 Dashboard Access

### First Time Setup
1. **Register** a new user with role = `prestataire` (or use existing one)
2. **Login** to the system
3. **Automatic Redirect** to `/provider-dashboard` or navigate manually
4. **Prestataire record** is auto-created on first login (no errors!)

### Access URL
```
http://your-domain.com/provider-dashboard
```

---

## 📋 Complete Feature Walkthrough

### 1️⃣ Dashboard Overview (Main Page)
**Location:** `/provider-dashboard`

What You See:
- Profile card with company photo
- 4 stats boxes (Total Services, Reservations, Pending, Photos)
- Latest 5 reservations table

Actions:
- Click "Modifier le profil" to update profile
- Click "Détails" on any reservation to view full details
- Click service name to see more info

---

### 2️⃣ Mon Profil (Profile Management)
**Location:** `/provider-dashboard/profile`

Edit These Fields:
- ✏️ **Nom de l'entreprise** - Your business name
- ✏️ **Description** - About your business
- ✏️ **Adresse** - Street address
- ✏️ **Ville** - City
- 📷 **Photo de profil** - Upload business logo/photo

Steps:
1. Click "Mon Profil" in sidebar
2. Fill in desired fields
3. Upload new photo (optional, drag & drop works!)
4. Click "Enregistrer" button

💡 **Tip:** Keep description concise - it appears on your public profile!

---

### 3️⃣ Services Management
**Location:** `/provider-dashboard/services`

#### View All Services
- See all your services in card layout
- Shows price, duration, category
- Edit or Delete buttons on each card

#### Add New Service
**Button:** "Ajouter un service" (green button)

Fields:
- 📝 Service Name (required)
- 📄 Description (required)
- 💰 Price in dollars (required)
- ⏱️ Duration in minutes (required)
- 🏷️ Category (required - dropdown)
- 🖼️ Service Image (optional)

Categories Available:
- Nettoyage (Cleaning)
- Réparation (Repair)
- Beauté (Beauty)
- Plomberie (Plumbing)
- Électricité (Electricity)
- Autre (Other)

#### Edit Service
1. Click "Modifier" button on service card
2. Update any fields
3. Upload new image if needed
4. Click "Enregistrer les modifications"

#### Delete Service
1. Click "Supprimer" button on service card
2. Confirm deletion

⚠️ **Note:** Deleting cascades to reservations for that service!

---

### 4️⃣ Reservations Management
**Location:** `/provider-dashboard/reservations`

#### View All Reservations
Table shows:
- Service name
- Client name
- Date & Time
- Status badge (color-coded)
- Action buttons

Status Colors:
- 🟡 **Pending** (Yellow) - Needs your response
- 🟢 **Accepted** (Green) - Confirmed
- 🔴 **Rejected** (Red) - Declined
- 🔵 **Completed** (Blue) - Done
- ⚪ **Cancelled** (Gray) - Cancelled

#### Manage Pending Reservations
On Pending requests, you can:
- ✅ **Accepter** - Confirm the booking
- ❌ **Refuser** - Decline the booking

#### Manage Accepted Reservations
On Accepted reservations, you can:
- ✔️ **Marquer comme complétée** - Mark service as done
- 🚫 **Annuler** - Cancel the reservation

#### View Full Details
1. Click "Voir" button on any reservation
2. See:
   - Complete service details
   - Client information & contact
   - Date & time
   - Price
   - Full description
3. Perform actions from this page

---

### 5️⃣ Photos Gallery
**Location:** `/provider-dashboard/photos`

#### View Gallery
- Grid layout showing all uploaded photos
- Date stamp on each photo
- Hover to see action buttons

#### Upload Photos
**Button:** "Ajouter des photos" (blue button)

Steps:
1. Click upload area OR drag & drop images
2. Select multiple photos at once (up to 12 preview)
3. Click "Télécharger les photos"
4. Photos appear in gallery instantly

Supported Formats:
- JPG
- PNG
- GIF
- Recommended: JPG or PNG (smaller file size)

Max File Size:
- 5MB per image

#### Set as Profile Photo
1. Hover over photo
2. Click user icon 👤
3. Instantly becomes profile photo

#### Delete Photo
1. Hover over photo
2. Click trash icon 🗑️
3. Photo removed from gallery

---

## 🔑 Quick Keyboard Navigation

| Page | Command |
|------|---------|
| Sidebar | Click any menu item |
| Services | Tab through form fields |
| Upload Photos | Drag & drop images |
| Reservations | Scroll table horizontally on mobile |

---

## 💾 File Upload Locations

All uploaded files go to: `storage/app/public/`

#### Service Images
```
storage/app/public/services/
  └── service-name-xyz.jpg
```

#### Profile Photos
```
storage/app/public/prestataire-photos/
  └── profile-photo-xyz.jpg
```

#### Gallery Photos
```
storage/app/public/photos/
  └── photo-xyz.jpg
```

**Note:** These are automatically served with `/storage/` prefix in URLs.

---

## ❌ Troubleshooting

### "Prestataire profile not found"
```
Solution:
1. Make sure you're logged in
2. Check your user's role = 'prestataire' in database
3. Log out and log back in to trigger auto-creation
```

### Images not showing (404 error)
```
Solution:
1. Run: php artisan storage:link
2. Check storage/app/public folder exists
3. Ensure correct file permissions (755+)
```

### Can't upload files (permission denied)
```
Solution:
Linux/Mac:
  chmod -R 775 storage

Windows:
  Right-click folder → Properties → Security → Edit
  Grant "Modify" permission
```

### Routes not working
```
Solution:
php artisan route:cache
or
php artisan optimize:clear
```

### Database errors
```
Solution:
php artisan migrate --fresh (⚠️ deletes data!)
or
php artisan migrate (adds new tables only)
```

---

## 🎨 UI Features Explained

### Sidebar
- **Always Visible** - Easy navigation at any time
- **Active Indicator** - Shows current page in darker blue
- **Icons** - Visual representation of each section
- **Logout** - Red logout button at bottom

### Stats Cards
- **Color Coded** - Each stat has different color
- **Large Numbers** - Easy to read at glance
- **Icons** - Visually represents the stat type

### Tables
- **Sortable** - Click header to sort (if enabled)
- **Responsive** - Stacks on mobile devices
- **Hover Effects** - Rows highlight on hover

### Modals (if used)
- Outside click to close
- Keyboard Escape to close
- Confirm actions before delete

### Notifications
- **Green** - Success messages (top right)
- **Red** - Error messages (top right)
- **Yellow** - Warning messages (if any)
- Auto-dismiss after 5 seconds or click X

---

## 📱 Mobile Usage

The dashboard is fully responsive:

### Mobile Features
- ✅ Touch-friendly buttons
- ✅ Stacked layout on small screens
- ✅ Horizontal scrolling for tables
- ✅ Full-width inputs
- ✅ Large tap targets

### Best Practices
1. Use portrait mode for main dashboard
2. Use landscape for tables (wider view)
3. Tap carefully on small buttons
4. Upload photos works on mobile

---

## 🔒 Security Notes

### Your Data
- ✅ Only you can see your dashboard
- ✅ Can't view other providers' data
- ✅ All actions require authentication
- ✅ Server validates all changes

### File Security
- ✅ Only image files allowed
- ✅ File size limits enforced
- ✅ Files in protected directory
- ✅ Can delete own files only

### Best Practices
- 🔐 Use strong password
- 🔐 Don't share your login
- 🔐 Log out after using public computer
- 🔐 Report suspicious activity

---

## 📞 Support

If you encounter issues:

1. **Check Error Message** - Read it carefully
2. **Check This Guide** - See troubleshooting section
3. **Clear Browser Cache** - Ctrl+Shift+Delete
4. **Try Different Browser** - Edge, Chrome, Firefox
5. **Contact Support** - With error message & steps

---

## 💡 Pro Tips

### Photography
- Use good lighting for photos
- Upload high-quality images
- Keep file sizes reasonable (< 5MB)
- Professional photos increase bookings

### Service Descriptions
- Be detailed but concise
- List benefits, not just features
- Include what's included
- Mention any requirements

### Reservation Management
- Respond quickly to bookings
- Check reservations daily
- Update status once service is done
- Build reputation through reviews

### Profile Optimization
- Complete all profile fields
- Use professional photo
- Update description regularly
- Add multiple portfolio photos

---

## 📊 Data You Can Manage

### Editable by You
- ✅ Service name, description, price, duration, category, image
- ✅ Profile info, company photo
- ✅ Reservation status
- ✅ Upload/delete photos

### Automatically Managed
- ✅ Dates & timestamps
- ✅ User relationships
- ✅ Status history

---

## 🎯 Getting Started Checklist

- [ ] Install & run migrations
- [ ] Create storage link
- [ ] Log in as prestataire
- [ ] Complete your profile
- [ ] Add at least 1 service
- [ ] Upload some photos
- [ ] Set profile photo
- [ ] Test reservation management
- [ ] Familiarize yourself with all pages
- [ ] Ready for clients! 🎉

---

**You're all set! Start managing your services and reservations! 🚀**

Last Updated: May 5, 2026
