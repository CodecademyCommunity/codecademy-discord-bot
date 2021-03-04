const verifications = {
  name: 'verifications',
  columns: [
    'id INT AUTO_INCREMENT PRIMARY KEY',
    'username VARCHAR(255)',
    'verify_id VARCHAR(255) NOT NULL',
    'expiration DATETIME',
  ],
};

const infractions = {
  name: 'infractions',
  columns: [
    'id INT AUTO_INCREMENT PRIMARY KEY',
    'timestamp DATETIME',
    'user VARCHAR(255) NOT NULL',
    'action VARCHAR(255)',
    'length_of_time VARCHAR(255)',
    'reason VARCHAR(255)',
    'valid BOOLEAN',
    'moderator VARCHAR(255)',
  ],
};

const modLog = {
  name: 'mod_log',
  columns: [
    'id INT AUTO_INCREMENT PRIMARY KEY',
    'timestamp DATETIME',
    'moderator VARCHAR(255) NOT NULL',
    'action VARCHAR(255)',
    'length_of_time VARCHAR(255)',
    'reason VARCHAR(255)',
  ],
};

const msgCounter = {
  name: 'msg_counter',
  columns: [
    'id INT AUTO_INCREMENT PRIMARY KEY',
    'timestamp DATETIME',
    'channel_name VARCHAR(255)',
  ],
};

const userNotes = {
  name: 'user_notes',
  columns: [
    'id INT AUTO_INCREMENT PRIMARY KEY',
    'timestamp DATETIME',
    'user VARCHAR(255) NOT NULL',
    'moderator VARCHAR(255) NOT NULL',
    'note VARCHAR(255)',
  ],
};

module.exports = {
  verifications: verifications,
  infractions: infractions,
  mod_log: modLog,
  msg_counter: msgCounter,
  user_notes: userNotes,
};
