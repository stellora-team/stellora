using Microsoft.EntityFrameworkCore;
using Stellora.Api.Models;

namespace Stellora.Api.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();    // DbSet<User> дозволяє звертатися до користувачів через dbContext.Users; OnModelCreating визначає правила таблиці
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var user = modelBuilder.Entity<User>();

        user.ToTable("users");

        user.HasKey(x => x.Id);

        user.Property(x => x.Email)
            .HasMaxLength(254)
            .IsRequired();

        user.Property(x => x.NormalizedEmail)
            .HasMaxLength(254)
            .IsRequired();

        user.HasIndex(x => x.NormalizedEmail)
            .IsUnique() // ключовий шматок - IsUnique(), після застосування міграції база заборонить два записи з однаковим NormalizedEmail
            .HasDatabaseName("ux_users_normalized_email");

        user.Property(x => x.DisplayName)
            .HasMaxLength(100)
            .IsRequired();

        user.Property(x => x.PasswordHash)
            .IsRequired();

        user.Property(x => x.CreatedAtUtc)
            .IsRequired();
        
        user.Property(x => x.TimeZone)
            .HasMaxLength(100)
            .HasDefaultValue("UTC")
            .IsRequired();
        
        var session = modelBuilder.Entity<UserSession>();

        session.ToTable("user_sessions");

        session.HasKey(x => x.Id);

        session.Property(x => x.CreatedAtUtc)
            .IsRequired();

        session.Property(x => x.ExpiresAtUtc)
            .IsRequired();

        session.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        var category = modelBuilder.Entity<Category>();

        category.ToTable("categories");

        category.HasKey(x => x.Id);

        category.Property(x => x.Id)
            .ValueGeneratedNever();

        category.Property(x => x.Code)
            .HasMaxLength(50)
            .IsRequired();

        category.HasIndex(x => x.Code)
            .IsUnique()
            .HasDatabaseName("ux_categories_code");

        category.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        category.Property(x => x.SortOrder)
            .IsRequired();

        category.HasData(
            new Category
            {
                Id = 1,
                Code = "health",
                Name = "Здоров’я",
                SortOrder = 10
            },
            new Category
            {
                Id = 2,
                Code = "learning",
                Name = "Навчання",
                SortOrder = 20
            },
            new Category
            {
                Id = 3,
                Code = "work",
                Name = "Робота",
                SortOrder = 30
            },
            new Category
            {
                Id = 4,
                Code = "finance",
                Name = "Фінанси",
                SortOrder = 40
            },
            new Category
            {
                Id = 5,
                Code = "relationships",
                Name = "Стосунки",
                SortOrder = 50
            },
            new Category
            {
                Id = 6,
                Code = "self-development",
                Name = "Саморозвиток",
                SortOrder = 60
            },
            new Category
            {
                Id = 7,
                Code = "leisure",
                Name = "Відпочинок",
                SortOrder = 70
            });
    }
}