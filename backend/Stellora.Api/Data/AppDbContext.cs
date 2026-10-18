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
    }
}