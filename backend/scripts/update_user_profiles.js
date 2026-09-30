const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../src/models/user');

async function updateProfiles() {
  try {
    await mongoose.connect(process.env.DB_CONNECT_STRING);
    console.log('Connected to MongoDB Atlas...');

    // Update Swastik with rich profile details
    await User.findOneAndUpdate(
      { emailId: 'swastik@leetcode.com' },
      {
        $set: {
          lastName: 'Kori',
          college: 'Jabalpur Engineering College (JEC)',
          graduationDetails: 'Class of 2028 • B.Tech CSE',
          location: 'Jabalpur, Madhya Pradesh, India',
          bio: 'CS undergraduate building intuition for Data Structures, algorithmic optimization, and system design.',
          website: 'swastik.dev',
          github: 'https://github.com/swastik-kori',
          linkedin: 'https://linkedin.com/in/swastik-kori',
          twitter: 'https://x.com/swastik_dev'
        }
      }
    );

    // Update Admin with appropriate details as well
    await User.findOneAndUpdate(
      { emailId: 'admin@leetcode.com' },
      {
        $set: {
          lastName: 'Portal',
          college: 'CodeQuest Engineering Institute',
          graduationDetails: 'Platform Administrator & Architect',
          location: 'Bengaluru, Karnataka, India',
          bio: 'Head of Problem Evaluation and Algorithmic System Architecture at CodeQuest.',
          website: 'codequest.dev',
          github: 'https://github.com/codequest-dev',
          linkedin: 'https://linkedin.com/company/codequest',
          twitter: 'https://x.com/codequest_dev'
        }
      }
    );

    console.log('User profiles updated successfully in MongoDB Atlas!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error updating profiles:', err);
    process.exit(1);
  }
}

updateProfiles();
