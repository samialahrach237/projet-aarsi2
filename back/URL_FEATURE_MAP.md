# 🗺️ Provider Dashboard - URL & Feature Map

## 🌐 All Dashboard URLs

### Main Dashboard
| URL | Method | Controller | Function |
|-----|--------|------------|----------|
| `/provider-dashboard` | GET | ProviderDashboardController | index |
| `/provider-dashboard/profile` | GET | ProviderDashboardController | profile |
| `/provider-dashboard/profile` | POST | ProviderDashboardController | updateProfile |

### Services Management
| URL | Method | Controller | Function |
|-----|--------|------------|----------|
| `/provider-dashboard/services` | GET | ServiceController | index |
| `/provider-dashboard/services/create` | GET | ServiceController | create |
| `/provider-dashboard/services` | POST | ServiceController | store |
| `/provider-dashboard/services/{id}/edit` | GET | ServiceController | edit |
| `/provider-dashboard/services/{id}` | PUT | ServiceController | update |
| `/provider-dashboard/services/{id}` | DELETE | ServiceController | destroy |

### Reservations Management
| URL | Method | Controller | Function |
|-----|--------|------------|----------|
| `/provider-dashboard/reservations` | GET | ReservationController | index |
| `/provider-dashboard/reservations/{id}` | GET | ReservationController | show |
| `/provider-dashboard/reservations/{id}/accept` | POST | ReservationController | accept |
| `/provider-dashboard/reservations/{id}/reject` | POST | ReservationController | reject |
| `/provider-dashboard/reservations/{id}/complete` | POST | ReservationController | complete |
| `/provider-dashboard/reservations/{id}/cancel` | POST | ReservationController | cancel |

### Photos Management
| URL | Method | Controller | Function |
|-----|--------|------------|----------|
| `/provider-dashboard/photos` | GET | PhotoController | index |
| `/provider-dashboard/photos/create` | GET | PhotoController | create |
| `/provider-dashboard/photos` | POST | PhotoController | store |
| `/provider-dashboard/photos/{id}` | DELETE | PhotoController | destroy |
| `/provider-dashboard/photos/{id}/set-profile` | POST | PhotoController | setAsProfile |

---

## 📋 Page Features Map

### 1. Dashboard Overview (`/provider-dashboard`)
**What You See:**
- [ ] Profile card with company photo
- [ ] Company name and city
- [ ] "Modifier le profil" button
- [ ] Stats card: Total Services (blue)
- [ ] Stats card: Total Reservations (green)
- [ ] Stats card: Pending Requests (yellow)
- [ ] Stats card: Total Photos (purple)
- [ ] Latest reservations table
  - Service name
  - Client name
  - Date (dd/mm/yyyy)
  - Status badge (colored)
  - "Détails" button

**Buttons & Actions:**
- Click profile photo → Shows profile card
- Click "Modifier le profil" → Go to profile page
- Click "Voir tout" → Go to reservations page
- Click "Détails" on reservation → Go to reservation details

---

### 2. My Profile (`/provider-dashboard/profile`)
**Fields to Edit:**
- [ ] Nom de l'entreprise (text input, required)
- [ ] Description (textarea, optional)
- [ ] Adresse (text input, required)
- [ ] Ville (text input, required)
- [ ] Photo de profil (file upload, optional)

**Current Info Display:**
- Profile photo (current or avatar)
- Company name
- City
- User email

**Buttons:**
- "Enregistrer" - Save changes
- "Annuler" - Go back to dashboard

**Validation:**
- All required fields must be filled
- Photo must be image file
- Success message on save

---

### 3. Services List (`/provider-dashboard/services`)
**Add Button:**
- "Ajouter un service" (blue button, top right)

**Service Cards (Grid Layout):**
- Service image or default placeholder
- Service name (heading)
- Description (truncated, 100 chars)
- Price (large, blue text)
- Duration in minutes (badge)
- Category name
- Two action buttons:
  - "Modifier" (blue) → Edit page
  - "Supprimer" (red) → Delete with confirmation

**Pagination:**
- 10 services per page
- Navigation links at bottom

**Empty State:**
- Icon + "Aucun service pour le moment"
- "Créer votre premier service" button

---

### 4. Create Service (`/provider-dashboard/services/create`)
**Form Fields:**
- [ ] Nom du service * (text, required)
- [ ] Description * (textarea, required)
- [ ] Prix ($) * (number, required, min 0)
- [ ] Durée (minutes) * (number, required, min 1)
- [ ] Catégorie * (dropdown, required)
  - Nettoyage
  - Réparation
  - Beauté
  - Plomberie
  - Électricité
  - Autre
- [ ] Image du service (file upload, optional)

**File Upload:**
- Click zone or drag & drop
- Supported: JPG, PNG, GIF
- Max: 2MB

**Buttons:**
- "Créer le service" (blue) - Submit form
- "Annuler" (gray) - Go back to services list

**Validation:**
- Client-side validation display
- Server-side validation enforced

---

### 5. Edit Service (`/provider-dashboard/services/{id}/edit`)
**Same as Create but:**
- Pre-filled with current values
- Current image displayed
- Button says "Enregistrer les modifications"
- All optional fields keep their values

---

### 6. Reservations List (`/provider-dashboard/reservations`)
**Table Columns:**
1. Service (service name)
2. Client (client name + email in small text)
3. Date (dd/mm/yyyy format)
4. Horaire (HH:mm - HH:mm format)
5. Statut (color-coded badge)
6. Actions (buttons)

**Status Badges:**
- 🟡 Pending - Yellow
- 🟢 Accepted - Green
- 🔴 Rejected - Red
- 🔵 Completed - Blue
- ⚪ Cancelled - Gray

**Action Buttons by Status:**

**If Pending:**
- "Voir" (blue, eye icon)
- "Accepter" (green, check icon) → Accepts reservation
- "Refuser" (red, X icon) → Rejects reservation

**If Accepted:**
- "Voir" (blue, eye icon)
- "Compléter" (blue, check-circle icon) → Marks as completed
- "Annuler" (gray, ban icon) → Cancels reservation

**If Rejected/Completed/Cancelled:**
- "Voir" (blue, eye icon) only

**Pagination:**
- 15 reservations per page

**Empty State:**
- Icon + "Aucune réservation pour le moment"

---

### 7. Reservation Details (`/provider-dashboard/reservations/{id}`)
**Left Column (Main Info):**
- Service name (large)
- Status badge (color-coded)
- Date (dd/mm/yyyy)
- Horaire (HH:mm - HH:mm)
- Full service description
- Service price (large, blue)
- Service duration (minutes)

**Action Section (if pending or accepted):**
- Colored box with action buttons
- "Accepter la réservation" (green) - if pending
- "Refuser la réservation" (red) - if pending
- "Marquer comme complétée" (blue) - if accepted
- "Annuler" (gray) - if accepted

**Right Column (Client Info - Sticky):**
- Client avatar
- Client name
- "Client" label
- Email address
- Phone (if available)
- City (if available)

**Back Button:**
- Arrow + "Retour aux réservations" (blue link)

---

### 8. Photos Gallery (`/provider-dashboard/photos`)
**Add Button:**
- "Ajouter des photos" (blue button, top right)

**Photo Grid:**
- 4 columns (responsive to 3 or 2 on smaller screens)
- Each photo shows:
  - Image (with hover effect)
  - Date stamp (bottom left, semi-transparent)
  - Hover overlay with two buttons:
    - User icon (set as profile photo)
    - Trash icon (delete photo)

**Empty State:**
- Icon + "Aucune photo pour le moment"
- "Télécharger votre première photo" button

**Pagination:**
- 12 photos per page

---

### 9. Upload Photos (`/provider-dashboard/photos/create`)
**File Upload Area:**
- Large drag & drop zone
- Cloud upload icon
- "Cliquez pour sélectionner des photos"
- "ou glissez-déposez des fichiers"
- "JPG, PNG, GIF (Max 5MB par fichier)"

**Live Preview:**
- 2-3 column grid
- Shows selected photos with checkmarks
- "+ X photo(s)" if more than 12 selected

**File Input:**
- Accepts multiple files
- Hidden input, triggered by label click

**Buttons:**
- "Télécharger les photos" (blue) - Upload all
- "Annuler" (gray) - Go back

**Drag & Drop:**
- Works on the entire upload zone
- Visual feedback on hover

**JavaScript Features:**
- Real-time preview generation
- File count display
- Drag & drop support

---

## 🎨 Visual Elements

### Colors Used
- **Primary Blue:** Dashboard background, buttons, stats
- **Success Green:** Accept buttons, green stats, success messages
- **Danger Red:** Delete buttons, reject buttons, error messages
- **Warning Yellow:** Pending status badges, alerts
- **Info Blue:** Completed status, info messages
- **Gray:** Neutral elements, disabled states

### Icons (Font Awesome)
- 📊 Chart Line - Dashboard
- ⚙️ Cogs - Services
- 📅 Calendar - Reservations
- 🖼️ Images - Photos
- 👤 User - Profile
- ➕ Plus - Add new
- ✏️ Edit - Edit item
- 🗑️ Trash - Delete item
- ✓ Check - Accept
- ✕ Times - Reject/Close
- 👁️ Eye - View details
- ☁️ Cloud Upload - Upload files

---

## 🔐 Authorization Matrix

| Resource | Create | Read | Update | Delete | Action |
|----------|--------|------|--------|--------|--------|
| Service | Own only | Own only | Own only | Own only | ✅ |
| Reservation | N/A | Own only | N/A | N/A | ✅ |
| Photo | Own only | Own only | N/A | Own only | ✅ |
| Profile | N/A | Own only | Own only | N/A | ✅ |

---

## 📱 Responsive Breakpoints

| Device | Sidebar | Layout | Grid |
|--------|---------|--------|------|
| Mobile | Stacks | Full width | 1 column |
| Tablet | Stacks | 80% width | 2 columns |
| Desktop | Fixed 256px | Flex | 3-4 columns |

---

## 💾 Storage Paths

```
storage/app/public/
├── services/
│   ├── service-image-xyz.jpg
│   └── service-image-abc.png
├── prestataire-photos/
│   ├── profile-photo-123.jpg
│   └── profile-photo-456.png
└── photos/
    ├── photo-gallery-001.jpg
    ├── photo-gallery-002.png
    └── photo-gallery-003.gif

Access via:
/storage/services/...
/storage/prestataire-photos/...
/storage/photos/...
```

---

## 🔄 Data Flow

### Creating a Service
```
User fills form → POST /services → Server validation → 
Image upload to storage → Create Service record → 
Redirect to services list with success message
```

### Managing Reservations
```
Reservation created by client → 
Provider sees in list → 
Provider clicks Accept/Reject → 
POST action → 
Update status in database → 
Redirect with success message
```

### Uploading Photos
```
User selects files → Preview generated → 
POST /photos → 
Each file uploaded to storage → 
Create Photo records → 
Grid view updated → 
Success message
```

---

## ✨ User Experience Flow

### First Time User
1. Login as prestataire
2. Auto-redirected to dashboard
3. Sees empty stats (no data yet)
4. Clicks "Mon Profil" to complete profile
5. Uploads company photo
6. Goes to Services → "Ajouter un service"
7. Creates first service with image
8. Uploads portfolio photos
9. Dashboard now shows stats!

### Handling Reservations
1. Client books a service
2. Provider sees reservation in "Réservations"
3. Status shows "Pending" (yellow)
4. Provider clicks "Accepter"
5. Status changes to "Accepted" (green)
6. When service is done, clicks "Marquer comme complétée"
7. Status changes to "Completed" (blue)

---

## 🎯 Quick Navigation

From any page, sidebar lets you jump to:
- 📊 Vue d'ensemble (Dashboard)
- ⚙️ Services
- 📅 Réservations
- 🖼️ Photos
- 👤 Mon Profil
- 🚪 Déconnexion (Logout)

Active page shows darker blue in sidebar.

---

**This map covers all 10 dashboard pages and 20+ routes!**

Last Updated: May 5, 2026
