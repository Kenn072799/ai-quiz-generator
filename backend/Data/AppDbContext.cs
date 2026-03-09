using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<Flashcard> Flashcards => Set<Flashcard>();
    public DbSet<StudySession> StudySessions => Set<StudySession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // User → Documents (cascade delete)
        modelBuilder.Entity<Document>()
            .HasOne(d => d.User)
            .WithMany(u => u.Documents)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Document → Topics (cascade delete)
        modelBuilder.Entity<Topic>()
            .HasOne(t => t.Document)
            .WithMany(d => d.Topics)
            .HasForeignKey(t => t.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Topic → Quizzes (cascade delete)
        modelBuilder.Entity<Quiz>()
            .HasOne(q => q.Topic)
            .WithMany(t => t.Quizzes)
            .HasForeignKey(q => q.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        // Quiz → Questions (cascade delete)
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Quiz)
            .WithMany(qz => qz.Questions)
            .HasForeignKey(q => q.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        // Topic → Flashcards (cascade delete)
        modelBuilder.Entity<Flashcard>()
            .HasOne(f => f.Topic)
            .WithMany(t => t.Flashcards)
            .HasForeignKey(f => f.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        // QuizAttempt: restrict on User delete to avoid cycles
        modelBuilder.Entity<QuizAttempt>()
            .HasOne(qa => qa.Quiz)
            .WithMany(q => q.QuizAttempts)
            .HasForeignKey(qa => qa.QuizId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<QuizAttempt>()
            .HasOne(qa => qa.User)
            .WithMany(u => u.QuizAttempts)
            .HasForeignKey(qa => qa.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // StudySession
        modelBuilder.Entity<StudySession>()
            .HasOne(s => s.Topic)
            .WithMany(t => t.StudySessions)
            .HasForeignKey(s => s.TopicId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StudySession>()
            .HasOne(s => s.User)
            .WithMany(u => u.StudySessions)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
