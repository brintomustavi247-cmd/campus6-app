# Firebase Setup

To bring RankPush to production:
1. Initialize Firebase Auth (Google Provider recommended).
2. Initialize Firestore.
3. Set up the `users` and `leaderboard_buckets` collections.
4. Apply standard security rules (users can only edit their own documents).
