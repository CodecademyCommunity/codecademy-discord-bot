const verifications = {
  name: 'verifications',
  columns: [
    'id INT AUTO_INCREMENT PRIMARY Key',
    'username varchar(255)',
    'verify_id varchar(255) NOT NULL',
    'expiration DATETIME',
  ],
};

const infractions = {
  name: 'infractions',
  columns: [
    'id INT AUTO_INCREMENT PRIMARY KEY',
    'timestamp DATETIME',
    'user varchar(255) NOT NULL',
    'action varchar(255)',
    'length_of_time varchar(255)',
    'reason varchar(255)',
    'valid boolean',
    'moderator varchar(255)',
  ],
};

const modLog = {
  name: 'mod_log',
  columns: [
    'id INT AUTO_INCREMENT PRIMARY KEY',
    'timestamp DATETIME',
    'moderator varchar(255) NOT NULL',
    'action varchar(255)',
    'length_of_time varchar(255)',
    'reason varchar(255)',
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
    'user varchar(255) NOT NULL',
    'moderator varchar(255) NOT NULL',
    'note varchar(255)',
  ],
};

module.exports = {
  verifications: verifications,
  infractions: infractions,
  mod_log: modLog,
  msg_counter: msgCounter,
  user_notes: userNotes,
};
