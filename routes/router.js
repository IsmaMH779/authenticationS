const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../lib/db.js');
const userMiddleware = require('../middleware/users.js');

//register route
router.post('/sign-up', userMiddleware.validateRegister, (req, res) => {
    db.query(
        'SELECT user_id FROM users WHERE LOWER(username) = LOWER(?)',
        [req.body.username],
        (err, result) => {
            if (result && result.length) {
                // error
                return res.status(409).send({
                    message: 'This username is already in use!',
                });
            } else {
                // username not in use
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).send({
                            message: err,
                        });
                    } else {
                        db.query(
                            'INSERT INTO users (username, email, password, registered) VALUES (?, ?, ?, now());',
                            [req.body.username, req.body.email, hash],
                            (err, result) => {
                                if (err) {
                                    return res.status(400).send({
                                        message: err,
                                    });
                                }
                                return res.status(201).send({
                                    message: 'Registered!',
                                });
                            }
                        );
                    }
                });
            }
        }
    );
});

//login route
router.post('/login', (req, res) => {
    db.query(
        `SELECT * FROM users WHERE username = ?;`,
        [req.body.username],
        (err, result) => {
            if (err) {
                return res.status(400).send({
                    message: err,
                });
            }
            if (!result.length) {
                return res.status(400).send({
                    message: 'Username or password incorrect!',
                });
            }
            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (bErr, bResult) => {
                    if (bErr) {
                        return res.status(400).send({
                            message: 'Username or password incorrect!',
                        });
                    }
                    if (bResult) {
                        // password match
                        const token = jwt.sign(
                            {
                                username: result[0].username,
                                user_Id: result[0].id,
                                pass: result[0].password
                            },
                            'SECRETKEY',
                            { expiresIn: '7d' }
                        );
                        db.query(`UPDATE users SET last_login = now() WHERE user_id = ?;`, [
                            result[0].id,
                        ]);
                        return res.status(200).send({
                            message: 'Logged in!',
                            token,
                            user: result[0],
                        });
                    }
                    return res.status(400).send({
                        message: 'Username or password incorrect!',
                    });
                }
            );
        }
    );
});


//update username route
router.put('/update-username', userMiddleware.isLoggedIn, (req, res) => {
    const userId = req.userData.user_Id;

    db.query(
        `SELECT * FROM users WHERE username = ? AND id != ?`,
        [req.body.newUsername, userId],
        (err, res) => {
            if (err) {
                console.error('Error searching username: ', err);
                return res.status(500).json({ error: 'internal server error' });
            }
            else if (res.length > 0) {
                res.status(400).json({ error: 'This user name is in use' });
            }
            else {
                db.query(
                    'UPDATE usuarios SET username = ? WHERE id = ?',
                    [newUsername, userId],
                    (updateErr, updateRes) => {
                        if (updateErr) {
                            console.error('Error update username: ', updateErr);
                            res.status(500).json({ error: 'Internal server error' });
                        } else {
                            res.status(200).json({ message: 'Username changed successfully' });
                        }
                    }
                );
            }
        }
    )
})

// update password
router.put('/change-password', userMiddleware.isLoggedIn, (req, res) => {
    const userId = res.userData.user_id;
    try {
        db.query(
            'SELECT * FROM usuarios WHERE id = ?',
            [userId],
            (err, res) => {
                if (err) {
                    console.error('Error searching user:  ', err);
                    res.status(500).json({ error: 'internal server error' });
                } else if (results.length === 0) {
                    res.status(404).json({ error: 'User not found' });
                }
                else {
                    const user = results[0];
                    const passwordMatch = bcrypt.compare(req.body.currentPasword, userData.pass);
                    if (passwordMatch) {
                        const hashedNewPassword = bcrypt.hash(newPassword, 10);

                        db.query(
                            'UPDATE usuarios SET password = ? WHERE id = ?',
                            [hashedNewPassword, userId],
                            (updateErr, updateRes) => {
                                if (updateErr) {
                                    console.error('Update password error: ', updateErr);
                                    res.status(500).json({ error: 'internal server error' });
                                }
                                else {
                                    res.status(200).json({ message: 'Password changed successfully' });
                                }
                            }
                        );
                    }
                    else {
                        res.status(401).json({ error: 'incorrect password' });
                    }
                }
            }
        );
    }
    catch (err) {
        console.error('Change password error', err);
        res.status(500).json({ error: 'internal server error' });
    }
});


//verified route example
router.get('/protected', userMiddleware.isLoggedIn, (req, res) => {
    console.log(req.userData)
    res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = router;