/**
 * Reservation Service - Handles reservation data management
 */

/**
 * Create a new reservation
 * @param {Object} reservationData - Reservation data object
 * @returns {Object} Created reservation with ID
 */
export const createReservation = (reservationData) => {
  const reservations = getAllReservations();
  const newReservation = {
    id: Date.now().toString(),
    ...reservationData,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  reservations.push(newReservation);
  localStorage.setItem('reservations', JSON.stringify(reservations));
  return newReservation;
};

/**
 * Get all reservations
 * @returns {Array} Array of reservation objects
 */
export const getAllReservations = () => {
  const reservations = localStorage.getItem('reservations');
  return reservations ? JSON.parse(reservations) : [];
};

/**
 * Get reservations by user (would need user ID in real app)
 * @returns {Array} Array of user's reservations
 */
export const getUserReservations = () => {
  // In a real app, this would filter by user ID
  return getAllReservations();
};

/**
 * Get reservation by ID
 * @param {string} id - Reservation ID
 * @returns {Object|undefined} Reservation object or undefined
 */
export const getReservationById = (id) => {
  const reservations = getAllReservations();
  return reservations.find(reservation => reservation.id === id);
};

/**
 * Update reservation status
 * @param {string} id - Reservation ID
 * @param {string} status - New status ('pending', 'confirmed', 'completed', 'cancelled')
 * @returns {Object|undefined} Updated reservation or undefined
 */
export const updateReservationStatus = (id, status) => {
  const reservations = getAllReservations();
  const reservationIndex = reservations.findIndex(r => r.id === id);
  
  if (reservationIndex !== -1) {
    reservations[reservationIndex].status = status;
    reservations[reservationIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('reservations', JSON.stringify(reservations));
    return reservations[reservationIndex];
  }
  return undefined;
};

/**
 * Delete reservation
 * @param {string} id - Reservation ID
 * @returns {boolean} Success status
 */
export const deleteReservation = (id) => {
  const reservations = getAllReservations();
  const filteredReservations = reservations.filter(r => r.id !== id);
  
  if (filteredReservations.length !== reservations.length) {
    localStorage.setItem('reservations', JSON.stringify(filteredReservations));
    return true;
  }
  return false;
};

/**
 * Get reservation statistics
 * @returns {Object} Statistics object
 */
export const getReservationStats = () => {
  const reservations = getAllReservations();
  
  return {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length
  };
};