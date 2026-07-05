const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Sample doctor data to seed
const sampleDoctors = [
  {
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@mediconnect.com',
    password: 'doctorpassword123',
    specialization: 'Cardiologist',
    experience: 12,
    fees: 150,
    hospital: 'Metro Heart Institute',
    bio: 'Dr. Sarah Jenkins is an experienced Cardiologist specializing in cardiovascular health, heart surgery prevention, and cardiac rehabilitation. She has over 12 years of clinical research experience.',
    availability: ['Monday', 'Wednesday', 'Friday']
  },
  {
    name: 'Dr. Amit Patel',
    email: 'amit.patel@mediconnect.com',
    password: 'doctorpassword123',
    specialization: 'Dermatologist',
    experience: 8,
    fees: 100,
    hospital: 'Skin Care and Laser Clinic',
    bio: 'Dr. Amit Patel is a board-certified Dermatologist focusing on skincare treatments, acne management, and cosmetic dermatology therapies. He is passionate about patient education.',
    availability: ['Tuesday', 'Thursday']
  },
  {
    name: 'Dr. Emily Watson',
    email: 'emily.watson@mediconnect.com',
    password: 'doctorpassword123',
    specialization: 'Pediatrician',
    experience: 15,
    fees: 120,
    hospital: 'St. Jude Childrens Hospital',
    bio: 'Dr. Emily Watson is a dedicated Pediatrician providing comprehensive child healthcare, immunization programs, and developmental milestones tracking. Over 15 years of childcare expertise.',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
  },
  {
    name: 'Dr. Michael Chang',
    email: 'michael.chang@mediconnect.com',
    password: 'doctorpassword123',
    specialization: 'General Physician',
    experience: 10,
    fees: 80,
    hospital: 'MediConnect Family Clinic',
    bio: 'Dr. Michael Chang is a General Physician dedicated to treating common acute illnesses, conducting wellness physicals, and managing chronic ailments (diabetes, hypertension).',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  }
];

const seedDatabase = async () => {
  try {
    // 1. Clean up existing Doctor user records
    console.log('Cleaning up existing doctor accounts...');
    const doctorEmails = sampleDoctors.map(doc => doc.email);
    await User.deleteMany({ email: { $in: doctorEmails } });
    await Doctor.deleteMany({});
    console.log('Cleanup completed.');

    // 2. Loop through and create User + Doctor records
    for (const docInfo of sampleDoctors) {
      console.log(`Creating account for ${docInfo.name}...`);
      
      // Hash the doctor password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(docInfo.password, salt);

      // Save User credential
      const user = new User({
        name: docInfo.name,
        email: docInfo.email,
        password: hashedPassword,
        role: 'doctor'
      });
      await user.save();

      // Save Doctor profile referencing User ObjectId
      const doctor = new Doctor({
        user: user._id,
        name: docInfo.name,
        specialization: docInfo.specialization,
        experience: docInfo.experience,
        fees: docInfo.fees,
        hospital: docInfo.hospital,
        bio: docInfo.bio,
        availability: docInfo.availability
      });
      await doctor.save();
    }

    console.log('Database successfully seeded with doctor profiles!');
    return true;
  } catch (error) {
    console.error('Seeding database failed:', error.message);
    throw error;
  }
};

module.exports = { seedDatabase, sampleDoctors };
