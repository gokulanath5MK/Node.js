const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Data storage (use local variables for simplicity, replace with a database in a real application)
let rooms = [];
let bookings = [];

// 1. Create a Room
app.post('/createRoom', (req, res) => {
  const { roomName, seats, amenities, pricePerHour } = req.body;
  const room = { roomName, seats, amenities, pricePerHour, bookings: [] };
  rooms.push(room);
  res.json({ message: 'Room created successfully.', room });
});

// 2. Book a Room
app.post('/bookRoom', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  // Check if the room is already booked for the given date and time
  const conflictingBooking = bookings.find(
    (booking) =>
      booking.roomId === roomId &&
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime))
  );

  if (conflictingBooking) {
    return res.status(400).json({ error: 'Room already booked for the given date and time.' });
  }

  const booking = { customerName, date, startTime, endTime, roomId, bookingId: bookings.length + 1, bookingDate: new Date(), status: 'Booked' };
  bookings.push(booking);

  // Update the room's bookings
  const room = rooms.find((room) => room.roomId === roomId);
  room.bookings.push(booking);

  res.json({ message: 'Room booked successfully.', booking });
});

// 3. List all Rooms with Booked Data
app.get('/listRooms', (req, res) => {
  const roomsWithBookings = rooms.map((room) => {
    const bookedData = room.bookings.map(({ customerName, date, startTime, endTime, status }) => ({
      roomName: room.roomName,
      bookedStatus: status,
      customerName,
      date,
      startTime,
      endTime,
    }));
    return { roomName: room.roomName, bookedData };
  });

  res.json({ rooms: roomsWithBookings });
});

// 4. List all Customers with Booked Data
app.get('/listCustomers', (req, res) => {
  const customersWithBookedData = bookings.map(({ customerName, roomId, date, startTime, endTime, status }) => ({
    customerName,
    roomName: rooms.find((room) => room.roomId === roomId)?.roomName,
    date,
    startTime,
    endTime,
    status,
  }));

  res.json({ customers: customersWithBookedData });
});

// 5. List how many times a customer has booked the room
app.get('/customerBookingHistory/:customerName', (req, res) => {
  const { customerName } = req.params;

  const customerBookingHistory = bookings
    .filter((booking) => booking.customerName === customerName)
    .map(({ customerName, roomId, date, startTime, endTime, bookingId, bookingDate, status }) => ({
      customerName,
      roomName: rooms.find((room) => room.roomId === roomId)?.roomName,
      date,
      startTime,
      endTime,
      bookingId,
      bookingDate,
      status,
    }));

  res.json({ customerBookingHistory });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
