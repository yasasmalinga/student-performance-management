import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { User } from '../../models/user.model';
import { ApiService } from '../../services/api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [ApiService]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { username, password } = this.loginForm.value;
        
        console.log('🔐 Attempting login with database authentication...');
        
        // Call the login API
        this.apiService.login(username, password).subscribe({
          next: (response) => {
            console.log('✅ Login response:', response);
            
            if (response.success && response.user) {
              const user: User = {
                userId: response.user.userId,
                userName: response.user.userName,
                userType: response.user.userType,
                userEmail: response.user.userEmail,
                userContact: response.user.userContact,
                password: '' // Don't store password
              };

              // Store user data in session/local storage (only in browser)
              if (isPlatformBrowser(this.platformId)) {
                if (this.loginForm.value.rememberMe) {
                  localStorage.setItem('currentUser', JSON.stringify(user));
                  console.log('💾 User saved to localStorage');
                } else {
                  sessionStorage.setItem('currentUser', JSON.stringify(user));
                  console.log('💾 User saved to sessionStorage');
                }
              }

              // Navigate based on user type
              this.navigateBasedOnUserType(user);
            } else {
              this.errorMessage = response.message || 'Invalid username or password';
              this.isLoading = false;
            }
          },
          error: (error) => {
            console.error('❌ Login error:', error);
            this.errorMessage = error.error?.message || 'Invalid username or password';
            this.isLoading = false;
          }
        });
        
      } catch (error) {
        this.errorMessage = 'Login failed. Please try again.';
        console.error('Login error:', error);
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private navigateBasedOnUserType(user: User) {
    switch (user.userType) {
      case 1: // Admin
        this.router.navigate(['/admin/dashboard']);
        break;
      case 2: // Teacher
        this.router.navigate(['/teacher/dashboard']);
        break;
      case 3: // Student
        this.router.navigate(['/student/dashboard']);
        break;
      case 4: // Parent
        this.router.navigate(['/parent/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for easy access in template
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
