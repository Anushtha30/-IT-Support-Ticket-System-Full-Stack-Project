// Demo authentication bypass for testing
export const isDemoMode = process.env.NODE_ENV === 'development';

export const demoUsers = {
  student: {
    id: "student1",
    email: "student@university.edu", 
    firstName: "Anushtha",
    lastName: "Sharma",
    profileImageUrl: null,
    role: "student",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  admin: {
    id: "admin1",
    email: "admin@university.edu",
    firstName: "IT", 
    lastName: "Admin",
    profileImageUrl: null,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
};

export function getDemoUser(role: 'student' | 'admin' = 'student') {
  return demoUsers[role];
}