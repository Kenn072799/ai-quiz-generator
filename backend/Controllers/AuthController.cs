using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, JwtService jwtService, IEmailService emailService, IConfiguration config) : ControllerBase
{
    private static readonly HashSet<string> AllowedLanguages = ["English", "Tagalog"];
    private static readonly HashSet<string> AllowedLevels = ["Elementary", "High School", "College"];

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!AllowedLanguages.Contains(dto.PreferredLanguage))
            return BadRequest(new { message = "Invalid preferred language." });

        if (!AllowedLevels.Contains(dto.EducationLevel))
            return BadRequest(new { message = "Invalid education level." });

        var exists = await db.Users.AnyAsync(u => u.Email == dto.Email.ToLower());
        if (exists)
            return Conflict(new { message = "Email is already registered." });

        var user = new User
        {
            Email = dto.Email.ToLower().Trim(),
            Name = dto.Name.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "student",
            PreferredLanguage = dto.PreferredLanguage,
            EducationLevel = dto.EducationLevel,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var token = jwtService.GenerateToken(user);
        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            PreferredLanguage = user.PreferredLanguage,
            EducationLevel = user.EducationLevel,
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        var token = jwtService.GenerateToken(user);
        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            PreferredLanguage = user.PreferredLanguage,
            EducationLevel = user.EducationLevel,
        });
    }

    // Placeholder: In production, send a real reset email via SMTP/SendGrid.
    // For now, returns the token in the response for development purposes.
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
        // Always return 200 to avoid user enumeration
        if (user is null)
            return Ok(new { message = "If that email exists, a reset link has been sent." });

        var resetToken = jwtService.GenerateToken(user);
        var frontendUrl = config["App:FrontendUrl"] ?? "http://localhost:5174";
        var resetParams = new System.Collections.Specialized.NameValueCollection
        {
            ["token"] = resetToken,
            ["email"] = user.Email
        };
        var query = string.Join("&", Array.ConvertAll(resetParams.AllKeys ?? [],
            k => $"{Uri.EscapeDataString(k!)}={Uri.EscapeDataString(resetParams[k]!)}"));
        var resetLink = $"{frontendUrl}/reset-password?{query}";

        try
        {
            await emailService.SendPasswordResetEmailAsync(user.Email, resetLink);
            return Ok(new { message = "If that email exists, a reset link has been sent." });
        }
        catch (Exception ex)
        {
            // In development, fall back to returning the link so the feature is still testable
            if (config["ASPNETCORE_ENVIRONMENT"] == "Development" ||
                Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                return Ok(new
                {
                    message = "Email sending failed (dev mode). Use the devToken below.",
                    devToken = resetToken,
                    devError = ex.Message
                });
            }

            return StatusCode(500, new { message = "Failed to send reset email. Please try again later." });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var emailFromToken = jwtService.ValidateEmailFromToken(dto.Token);
        if (emailFromToken is null ||
            !emailFromToken.Equals(dto.Email.Trim().ToLower(), StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Invalid or expired reset token." });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower().Trim());
        if (user is null)
            return BadRequest(new { message = "Invalid request." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await db.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully." });
    }

    // PUT /api/auth/settings — update language and education level
    [HttpPut("settings")]
    [Authorize]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsDto dto)
    {
        if (!AllowedLanguages.Contains(dto.PreferredLanguage))
            return BadRequest(new { message = "Invalid preferred language." });

        if (!AllowedLevels.Contains(dto.EducationLevel))
            return BadRequest(new { message = "Invalid education level." });

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        user.Name = dto.Name.Trim();
        user.PreferredLanguage = dto.PreferredLanguage;
        user.EducationLevel = dto.EducationLevel;
        await db.SaveChangesAsync();

        // Issue a new token so the updated claims take effect immediately
        var newToken = jwtService.GenerateToken(user);
        return Ok(new AuthResponseDto
        {
            Token = newToken,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            PreferredLanguage = user.PreferredLanguage,
            EducationLevel = user.EducationLevel,
        });
    }
}
